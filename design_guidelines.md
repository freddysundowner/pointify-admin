# Pointify Admin Dashboard Design Guidelines

## Design Approach
**Design System**: Modern dashboard patterns inspired by Linear, Stripe Dashboard, and Material Design principles. This is a utility-focused, data-heavy application where efficiency and clarity are paramount.

## Typography System

**Font Family**: Inter (via Google Fonts CDN)

**Hierarchy**:
- Page Titles: text-2xl, font-semibold (32px)
- Section Headers: text-xl, font-semibold (24px)
- Card/Widget Titles: text-lg, font-medium (18px)
- Table Headers: text-sm, font-medium, uppercase tracking-wide (14px)
- Body Text: text-base, font-normal (16px)
- Table Data: text-sm, font-normal (14px)
- Labels/Captions: text-xs, font-medium (12px)
- Metadata/Timestamps: text-xs, font-normal (11px)

## Layout System

**Container Structure**:
- Sidebar: Fixed width 16rem (256px), full height
- Main Content: flex-1 with max-w-7xl inner container
- Page Padding: px-8 py-6 for main content area

**Spacing Scale** (Tailwind units):
- Use consistent spacing: 2, 3, 4, 6, 8, 12, 16
- Component gaps: gap-4 for cards, gap-6 for sections
- Section spacing: mb-6 between major sections, mb-8 for page divisions
- Card padding: p-6 for content cards
- Table cells: px-4 py-3

**Grid Systems**:
- Dashboard Overview: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 for stat cards
- Product/Inventory Lists: Full-width tables with responsive overflow
- Analytics: grid-cols-1 lg:grid-cols-2 for chart layouts

## Component Library

### Navigation
**Sidebar Navigation**:
- Logo area at top (h-16)
- Menu items: py-3 px-4 with icons (20px) from Heroicons
- Active state with subtle visual indicator
- Grouped sections: Dashboard, Products, Orders, Customers, Inventory, Analytics, Settings
- Bottom section for user profile/logout

**Top Bar**:
- Search bar (max-w-md)
- Quick actions and notifications
- User avatar dropdown

### Data Display

**Stat Cards** (Dashboard Overview):
- Compact cards displaying: metric title, large number, percentage change indicator
- Icon in corner (24px)
- Height: min-h-32

**Data Tables**:
- Striped rows for readability
- Sortable column headers with sort indicators
- Row height: h-12
- Sticky header on scroll
- Pagination controls at bottom
- Inline action buttons (edit, delete, view)
- Checkbox column for bulk actions

**Charts** (Analytics):
- Use Chart.js library
- Card-based containers with title and time range selector
- Types: Line charts (revenue trends), Bar charts (product comparisons), Donut charts (category breakdown)
- Legend below or beside chart

### Forms & Input

**Form Layout**:
- Two-column grid for efficiency: grid-cols-1 md:grid-cols-2
- Full-width for text areas and complex inputs
- Labels above inputs (text-sm, font-medium, mb-2)
- Input height: h-10 for text inputs
- Form sections with dividing headers

**Input Components**:
- Text inputs with border, rounded corners (rounded-md)
- Select dropdowns with chevron icon
- Search inputs with magnifying glass icon
- Date pickers and number spinners
- File upload with drag-and-drop zone
- Toggle switches for boolean values

**Buttons**:
- Primary: px-4 py-2, rounded-md, font-medium
- Secondary: Similar sizing with different visual treatment
- Icon buttons: p-2, rounded-md (for table actions)
- Button groups for related actions

### Overlays

**Modals**:
- Centered overlay with max-w-2xl
- Header with title and close button
- Body with appropriate padding (p-6)
- Footer with action buttons right-aligned
- Backdrop with opacity

**Dropdowns**:
- Compact menu items
- Dividers for logical grouping
- Icons for visual clarity (16px)

**Toasts/Notifications**:
- Fixed position top-right
- Success, error, warning, info variants
- Auto-dismiss after 5 seconds
- Close button

### Empty States & Loading

**Empty States**:
- Centered content with illustration placeholder or icon
- Helpful message and primary action button
- Used in tables with no data, empty search results

**Loading States**:
- Skeleton loaders matching table/card structure
- Spinner for button loading states
- Progress bars for file uploads

## Critical Dashboard Sections

**Dashboard Overview**: 4 stat cards (Total Revenue, Orders Today, Active Products, Low Stock Items) + 2 charts (Revenue Trend, Top Products)

**Products Management**: Data table with columns (Image thumbnail, Name, SKU, Category, Price, Stock, Actions) + Add Product button

**Orders Management**: Table with Order ID, Customer, Date, Status badge, Total, Actions + Filter by status/date

**Customer Database**: Table with Name, Email, Phone, Total Orders, Lifetime Value, Last Purchase + Search functionality

**Inventory**: Stock level table with Low Stock alerts highlighted, Restock button, Stock adjustment modal

**Analytics Dashboard**: Multiple chart cards showing various metrics with date range selectors

## Icons
Use **Heroicons** (outline style) via CDN for all interface icons.