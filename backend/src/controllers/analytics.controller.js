import Order from "../models/Order.js";
import User from "../models/User.js";
import { sendSuccess } from "../utils/response.js";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// @desc  All analytics data in one call
// @route GET /api/admin/analytics
// @access Admin
export const getAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1); // inclusive of current month

    // ── Run everything in parallel ────────────────────────────────────────
    const [
      totalUsers,
      totalOrders,
      revenueAgg,
      statusAgg,
      monthlyAgg,
      topProductsAgg,
      newUsersAgg,
      periodicAgg,
    ] = await Promise.all([
      // 1. Total users
      User.countDocuments(),

      // 2. Total orders
      Order.countDocuments(),

      // 3. Total revenue (delivered orders only)
      Order.aggregate([
        { $match: { orderStatus: "delivered" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),

      // 4. Orders by status
      Order.aggregate([
        { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
      ]),

      // 5. Revenue + orders per month (last 6 months, non-cancelled)
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo },
            orderStatus: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$totalPrice" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // 6. Top 5 products by revenue (non-cancelled)
      Order.aggregate([
        { $match: { orderStatus: { $ne: "cancelled" } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.name",
            revenue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] },
            },
            quantity: { $sum: "$items.quantity" },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),

      // 7. New users per month (last 6 months)
      User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // 8. Day, Week, Month specific metrics
      Order.aggregate([
        {
          $match: {
            $or: [
              { createdAt: { $gte: new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000) } },
              { deliveredAt: { $gte: new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000) } }
            ]
          }
        },
        {
          $group: {
            _id: null,
            revenueToday: {
              $sum: {
                $cond: [
                  { $and: [{ $gte: ["$deliveredAt", new Date(new Date().setHours(0,0,0,0))] }, { $eq: ["$orderStatus", "delivered"] }] },
                  "$totalPrice",
                  0
                ]
              }
            },
            revenueWeek: {
              $sum: {
                $cond: [
                  { $and: [{ $gte: ["$deliveredAt", new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).setHours(0,0,0,0)] }, { $eq: ["$orderStatus", "delivered"] }] },
                  "$totalPrice",
                  0
                ]
              }
            },
            revenueMonth: {
              $sum: {
                $cond: [
                  { $and: [{ $gte: ["$deliveredAt", new Date(new Date().getFullYear(), new Date().getMonth(), 1)] }, { $eq: ["$orderStatus", "delivered"] }] },
                  "$totalPrice",
                  0
                ]
              }
            },
            ordersToday: {
              $sum: {
                $cond: [{ $gte: ["$createdAt", new Date(new Date().setHours(0,0,0,0))] }, 1, 0]
              }
            },
            ordersWeek: {
              $sum: {
                $cond: [{ $gte: ["$createdAt", new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).setHours(0,0,0,0)] }, 1, 0]
              }
            },
            ordersMonth: {
              $sum: {
                $cond: [{ $gte: ["$createdAt", new Date(new Date().getFullYear(), new Date().getMonth(), 1)] }, 1, 0]
              }
            }
          }
        }
      ]),
    ]);

    // ── Shape monthly chart data (fill missing months with 0) ────────────
    const monthlyMap = {};
    const userMonthMap = {};

    monthlyAgg.forEach(({ _id, revenue, orders }) => {
      monthlyMap[`${_id.year}-${_id.month}`] = { revenue, orders };
    });
    newUsersAgg.forEach(({ _id, count }) => {
      userMonthMap[`${_id.year}-${_id.month}`] = count;
    });

    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const label = MONTH_NAMES[d.getMonth()];
      chartData.push({
        month: label,
        revenue: monthlyMap[key]?.revenue || 0,
        orders: monthlyMap[key]?.orders || 0,
        newUsers: userMonthMap[key] || 0,
      });
    }

    // ── Status breakdown ─────────────────────────────────────────────────
    const statusMap = {
      placed: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0,
    };
    statusAgg.forEach(({ _id, count }) => {
      statusMap[_id] = count;
    });

    // ── Total revenue scalar ─────────────────────────────────────────────
    const totalRevenue = revenueAgg[0]?.total || 0;
    
    // Day, Week, Month scalar
    const pStats = periodicAgg[0] || {};

    sendSuccess(res, 200, "Analytics fetched", {
      summary: {
        totalRevenue,
        totalOrders,
        totalUsers,
        deliveredOrders: statusMap.delivered,
        cancelledOrders: statusMap.cancelled,
        pendingOrders: statusMap.placed,
        outForDelivery: statusMap.out_for_delivery,
        revenueToday: pStats.revenueToday || 0,
        revenueWeek: pStats.revenueWeek || 0,
        revenueMonth: pStats.revenueMonth || 0,
        ordersToday: pStats.ordersToday || 0,
        ordersWeek: pStats.ordersWeek || 0,
        ordersMonth: pStats.ordersMonth || 0,
      },
      chartData, // last 6 months — revenue, orders, newUsers per month
      topProducts: topProductsAgg.map((p) => ({
        name: p._id,
        revenue: p.revenue,
        quantity: p.quantity,
      })),
    });
  } catch (err) {
    next(err);
  }
};

