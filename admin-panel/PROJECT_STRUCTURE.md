# Admin Panel - Project Structure & Overview

## 📋 Project Summary
**Admin Panel** is a modern Next.js 16.2.6 dashboard application for managing the Red Rose Mart e-commerce platform. It provides a comprehensive interface for administrators to manage products, orders, users, analytics, and system settings with a responsive design that works seamlessly on desktop and mobile devices.

---

## 🏗️ Architecture & Technology Stack

### Core Technologies
- **Framework**: Next.js 16.2.6 (App Router with React 19.2.4)
- **Styling**: Tailwind CSS 4 + PostCSS
- **UI Components**: Lucide React (icons)
- **Theme Management**: next-themes (dark/light mode support)
- **Notifications**: react-hot-toast (toast notifications)
- **Charts & Calendar**: recharts 3.8.1, react-calendar 6.0.1
- **JavaScript**: ES6+ with JSX/TSX support

### Build Tools
- **Package Manager**: npm/pnpm
- **Linting**: ESLint 9
- **Configuration**: jsconfig.json with path aliases

---

## 📁 Project Structure

```
admin-panel/
├── src/
│   └── app/
│       ├── components/
│       │   ├── Navbar.js          # Top navigation bar with notifications
│       │   └── Sidebar.js         # Main navigation sidebar
│       ├── pages (route folders)
│       │   ├── page.js            # Dashboard home page
│       │   ├── products/
│       │   │   └── page.js        # Products/Inventory management
│       │   ├── orders/
│       │   │   └── page.js        # Orders management
│       │   ├── users/
│       │   │   └── page.js        # Users management
│       │   ├── analytics/
│       │   │   └── page.js        # Analytics & reports
│       │   ├── settings/
│       │   │   └── page.js        # Settings configuration
│       │   └── login/
│       │       └── page.js        # Login page
│       ├── layout.js              # Root layout (RootLayout)
│       ├── globals.css            # Global Tailwind styles
│       ├── favicon.ico            # Browser tab icon
│       ├── middleware.js          # API middleware
│       └── loading-backup.js      # Loading state backup
├── public/                        # Static assets
├── .next/                         # Next.js build output (auto-generated)
├── node_modules/                  # Dependencies
├── package.json                   # Project metadata & dependencies
├── package-lock.json              # Lock file for npm
├── pnpm-lock.yaml                 # Lock file for pnpm
├── jsconfig.json                  # Path aliases configuration
├── postcss.config.mjs             # PostCSS configuration
├── next.config.mjs                # Next.js configuration
├── eslint.config.mjs              # ESLint rules
├── .gitignore                     # Git ignore patterns
├── README.md                      # Standard Next.js README
└── PROJECT_STRUCTURE.md           # This file
```

---

## 🔧 File Descriptions

### Configuration Files

#### `jsconfig.json`
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```
**Purpose**: Enables path alias `@/` to reference the `src/` directory, allowing imports like `@/components/Navbar` instead of relative paths.

#### `next.config.mjs`
Currently minimal configuration. Can be extended for:
- Image optimization
- Environment variables
- Redirects and rewrites
- Custom webpack configuration

#### `postcss.config.mjs`
Configures PostCSS for processing Tailwind CSS. Works with Tailwind CSS 4.

#### `package.json`
**Dependencies**:
- `next`: Framework
- `react` & `react-dom`: UI library
- `tailwindcss`: CSS framework
- `lucide-react`: Icon library
- `next-themes`: Theme provider
- `react-hot-toast`: Notifications
- `recharts`: Charting library
- `react-calendar`: Calendar widget

**Scripts**:
- `npm run dev`: Start development server (port 3000)
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

---

## 📄 Page Components

### Layout Hierarchy
```
RootLayout (layout.js)
  └── All Pages inherit this layout
```

### Page Structure
All pages follow a standard pattern:
```jsx
"use client";  // Client-side component

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function PageName() {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-0 lg:ml-56">
        <Navbar />
        <div className="p-6">
          {/* Page content */}
        </div>
      </div>
    </div>
  );
}
```

### Page Details

#### **`page.js` - Dashboard Home**
**Purpose**: Main dashboard landing page  
**Features**:
- Summary cards (Total Products, Orders, Low Stock, Pending Orders)
- Low Stock Alerts section
- Recent Orders display
- Quick Actions buttons
- Static mock data (no backend integration yet)

**Key Components**:
- 4 summary cards with icons
- 2 data tables (alerts & orders)
- Action buttons grid

---

#### **`products/page.js` - Inventory Management**
**Purpose**: Add, view, edit, and delete products  
**Features**:
- Add product form with fields: Name, Category, Variant, Description, Price, Stock, Image
- Product image upload (file or URL)
- Products table with all product details
- Edit stock quantity (via prompt dialog)
- Delete product functionality
- Image preview before adding

**State Management**:
```javascript
products[]          // Array of product objects
name, category, variant, description, price, stock, image  // Form inputs
```

**Product Object Structure**:
```javascript
{
  id: number,
  name: string,
  category: string,
  variant: string,
  description: string,
  price: string,
  stock: number | null,
  image: string (URL or data URL)
}
```

**Key Functions**:
- `handleImageUpload()`: Convert file to data URL
- `addProduct()`: Validate and add to products array
- `deleteProduct(id)`: Remove product from array
- `editStock(id)`: Update stock quantity via prompt

---

#### **`orders/page.js` - Orders Management**
**Purpose**: View and manage customer orders  
**Expected Features**: 
- Order list/table
- Order details view
- Status tracking
- Filtering/search
*(Structure not yet examined)*

---

#### **`users/page.js` - Users Management**
**Purpose**: Manage customer accounts and roles  
**Expected Features**:
- User list/table
- User details
- Role management
- User actions (ban, suspend, etc.)
*(Structure not yet examined)*

---

#### **`analytics/page.js` - Analytics & Reports**
**Purpose**: Business metrics and analytics dashboard  
**Expected Features**:
- Sales charts
- Revenue graphs
- User activity analytics
- Performance metrics
*(Structure not yet examined)*

---

#### **`settings/page.js` - Settings & Configuration**
**Purpose**: System and application settings  
**Expected Features**:
- General settings
- Theme preferences
- Notification settings
- Admin profile
*(Structure not yet examined)*

---

#### **`login/page.js` - Authentication**
**Purpose**: Admin login page  
**Expected Features**:
- Email/password login
- Form validation
- Session management
*(Structure not yet examined)*

---

### Root Layout (`layout.js`)
**Purpose**: Wraps all pages with global providers and styles

**Providers**:
- `ThemeProvider`: Enables theme switching (light/dark mode)
- `Toaster`: Global toast notification system

**Configuration**:
```javascript
{
  attribute: "class",
  defaultTheme: "light"
}
```

**CSS**: Imports `globals.css` (Tailwind CSS imports)

---

## 🧩 Reusable Components

### **Sidebar (`components/Sidebar.js`)**
**Purpose**: Main navigation menu and branding

**Features**:
- Mobile responsive (collapsible on small screens)
- Collapsible sidebar on desktop (expanded/collapsed state)
- Active link highlighting
- Menu items with icons
- Admin profile section at bottom
- Mobile overlay when sidebar is open

**Menu Items**:
1. Dashboard (/)
2. Products (/products)
3. Orders (/orders)
4. Users (/users)
5. Analytics (/analytics)
6. Settings (/settings)

**State**:
```javascript
openSidebar    // Mobile drawer visibility
collapsed      // Desktop sidebar collapse state
```

**Key Features**:
- Uses `usePathname()` to detect active route
- Responsive: Hidden on mobile, always visible on large screens
- Hover effects and smooth transitions
- Dark theme (black background, white text, red accent)

---

### **Navbar (`components/Navbar.js`)**
**Purpose**: Top navigation bar with search and notifications

**Features**:
- Dashboard title
- Search input (hidden on mobile)
- Notifications dropdown (3 static notifications)
- Notification badge with count
- Admin profile display
- Logout button

**State**:
```javascript
openNotifications  // Dropdown visibility
```

**Notifications Structure**:
```javascript
{
  title: string,
  time: string
}
```

**Key Features**:
- Sticky positioning (stays at top on scroll)
- Dropdown menu for notifications
- Responsive design (search hidden on mobile)
- Red logout button with icon

---

## 🎨 Design System & Styling

### Color Palette
- **Primary**: Red (#FF0000) - Brand color
- **Background**: White (#FFFFFF), Gray-100 (#F3F4F6)
- **Text**: Black (#000000), Gray-500 (#6B7280)
- **Alerts**: 
  - Red (critical)
  - Yellow (warning)
  - Green (success)
  - Blue (info)

### Tailwind Classes Used
- Layout: `flex`, `grid`, `gap`, `p-*`, `ml-*`
- Colors: `bg-white`, `text-black`, `bg-red-500`, etc.
- Spacing: `mb-8`, `px-6`, `py-3`
- Sizing: `w-*`, `h-*` (w-12, h-12)
- Borders: `rounded-xl`, `border`, `border-gray-200`
- Responsive: `lg:`, `md:`, `hidden md:flex`
- Effects: `shadow-md`, `shadow-xl`, `hover:bg-gray-200`

### Responsive Breakpoints
- **Mobile**: < 768px (md breakpoint)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px (lg breakpoint)
- **Wide**: 1280px+ (xl breakpoint)

---

## 🔄 Data Flow & State Management

### Current Approach
- **Local State**: Each component manages its own state using `useState()`
- **No Global State**: No Redux, Context API, or Zustand (future enhancement)
- **Static Data**: All data is hardcoded or mock data in components

### Example: Products Page State
```javascript
const [products, setProducts] = useState([...]);  // Product array
const [name, setName] = useState("");            // Form inputs
const [category, setCategory] = useState("");
// ... more form fields
```

### Future Integration Points
- Backend API calls for products, orders, users
- Global state management for user authentication
- Real-time updates via WebSockets or polling
- Database persistence

---

## 🚀 Running the Project

### Development
```bash
npm run dev
# or
pnpm dev
```
Access at: `http://localhost:3000`

### Production Build
```bash
npm run build
npm run start
```

### Linting
```bash
npm run lint
```

---

## 📱 Responsive Design Details

### Mobile Behavior
- Sidebar hidden, accessible via menu icon in top-right
- Search hidden in navbar
- Grid columns collapse to 1 column
- Padding adjusted for smaller screens

### Desktop Behavior
- Sidebar always visible (can be collapsed)
- Full navbar with search visible
- Multi-column grids (2-4 columns)
- Full padding and spacing

### Breakpoint Usage
```
Hidden on mobile:        hidden md:flex, md:block, lg:hidden
Margin adjustments:      ml-0 lg:ml-56 (main content margin)
Grid responsiveness:     grid-cols-1 md:grid-cols-2 xl:grid-cols-4
```

---

## 🔐 Security & Auth Notes

- Currently **no authentication** implemented
- `middleware.js` exists but not configured
- Login page exists but non-functional
- **Future**: Implement OAuth, JWT, session management
- No protected routes yet

---

## 📦 Dependencies at a Glance

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.2.6 | Framework |
| react | 19.2.4 | UI Library |
| tailwindcss | 4 | Styling |
| lucide-react | 1.16.0 | Icons |
| next-themes | 0.4.6 | Theme Provider |
| react-hot-toast | 2.6.0 | Notifications |
| recharts | 3.8.1 | Charts |
| react-calendar | 6.0.1 | Calendar |

---

## 🎯 Key Routing Paths

| Route | File | Purpose |
|-------|------|---------|
| `/` | `page.js` | Dashboard |
| `/products` | `products/page.js` | Inventory |
| `/orders` | `orders/page.js` | Orders |
| `/users` | `users/page.js` | Users |
| `/analytics` | `analytics/page.js` | Analytics |
| `/settings` | `settings/page.js` | Settings |
| `/login` | `login/page.js` | Login |

---

## 🔗 Integration with Red Rose Mart Ecosystem

This admin panel is part of the **Red Rose Mart** project:
- **Backend**: Express.js + MongoDB (separate repo)
- **Mobile App**: React Native (separate repo)
- **Admin Panel**: Next.js (this repo)

**Connection Points** (to implement):
- Backend API endpoints for CRUD operations
- Authentication via OAuth/JWT
- Real-time updates for inventory & orders
- Image storage (Cloudinary or S3)

---

## 📝 Future Enhancements

1. **Backend Integration**: Connect to API endpoints
2. **Authentication**: Implement JWT/OAuth login
3. **Real-time Updates**: WebSocket for live data
4. **Data Persistence**: Database for products, orders, users
5. **Analytics Charts**: Interactive charts using recharts
6. **Export Features**: Download reports as PDF/CSV
7. **Advanced Filtering**: Search, sort, and filter tables
8. **User Roles**: Admin, Manager, Staff permissions
9. **Notifications**: Real-time alerts and toasts
10. **Dark Mode**: Full dark theme implementation

---

## 🧪 Testing & Quality

- **Linting**: ESLint configured
- **No Unit Tests**: Consider adding Jest + React Testing Library
- **No E2E Tests**: Consider adding Playwright or Cypress

---

## 📚 Developer Notes

### Import Aliases
Use `@/` prefix for imports:
```javascript
import Sidebar from "@/app/components/Sidebar";  // ✅ Good
import Sidebar from "./components/Sidebar";     // ❌ Avoid
```

### Component Conventions
- All pages use `"use client"` directive (client-side rendering)
- Lucide icons imported individually for tree-shaking
- Tailwind classes used inline (no CSS modules)

### File Naming
- Components: PascalCase (`Navbar.js`)
- Pages: lowercase (`page.js`)
- Styles: `globals.css` for global, inline for component-specific

---

## 📞 Git Information

- **Current Branch**: main
- **Latest Commits**:
  - b85d852: Enhanced ProfileScreen (from customer-facing app)
  - 49b91b5: Added push notifications and filters
  - 43bf755: Refactored Cart, Order, Success screens

---

**Last Updated**: 2026-05-24
**Version**: 0.1.0
**Status**: Active Development
