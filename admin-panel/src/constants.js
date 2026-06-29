export const STATUS_COLORS = {
  placed:           "bg-yellow-100 text-yellow-700",
  confirmed:        "bg-yellow-100 text-yellow-700",
  preparing:        "bg-yellow-100 text-yellow-700",
  out_for_delivery: "bg-blue-100 text-blue-700",
  delivered:        "bg-green-100 text-green-700",
  cancelled:        "bg-red-100 text-red-700",
};

export const STATUS_LABELS = {
  placed:           "Pending",
  confirmed:        "Confirmed",
  preparing:        "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered:        "Delivered",
  cancelled:        "Cancelled",
};

export const CATEGORIES = [
    { id: "vegetables", label: "Vegetables & Fruits" },
    { id: "dairy",      label: "Dairy & Breakfast" },
    { id: "snacks",     label: "Snacks & Munchies" },
    { id: "beverages",  label: "Cold Drinks & Juices" },
    { id: "bakery",     label: "Bakery & Biscuits" },
    { id: "meat",       label: "Chicken, Meat & Fish" },
    { id: "personal",   label: "Personal Care" },
    { id: "household",  label: "Household Essentials" },
];

export const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map(c => [c.id, c.label]));
