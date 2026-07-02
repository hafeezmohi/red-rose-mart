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
    { id: "rice-grains", label: "Food Grains" },
    { id: "instant-foods", label: "Instant Foods" },
    { id: "snacks", label: "Snacks" },
    { id: "oil-masala", label: "Oil & Masala" },
    { id: "beverages", label: "Beverages" },
    { id: "other", label: "Other Products" },
    { id: "offers", label: "Special Offers" },
    { id: "beauty-and-personal-care", label: "Beauty & Personal Care" },
    { id: "dryfruits", label: "Dryfruits" }
  ];

export const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map(c => [c.id, c.label]));
