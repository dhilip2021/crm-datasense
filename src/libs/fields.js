/*
  🔧 Full Contact Form Builder UI
  - Next.js 14 (App Router)
  - Drag & Drop with @dnd-kit
  - No Shadcn, plain Tailwind CSS
  - Features: Add fields, edit label/placeholder, required toggle, delete, save as JSON, drag reorder
*/

// === lib/fieldTypes.js ===
export const fieldTypes = [
  { type: 'single_line', label: 'Single Line' },
  { type: 'email', label: 'Email' },
  { type: 'phone', label: 'Phone' },
  { type: 'date', label: 'Date' },
  { type: 'number', label: 'Number' },
  { type: 'picklist', label: 'Pick List' }
]