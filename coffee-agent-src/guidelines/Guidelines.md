# Litespace Coffee Chat - Design System Guidelines

## Color Palette

### Primary Colors
- **Primary Purple**: `#635BFF` - Main brand color for primary actions and highlights
- **Primary Purple Hover**: `#5850E6` - Hover state for primary buttons

### Neutral Colors
- **Text Primary**: `#041C33` - Primary text color
- **Text Secondary**: `#304050` - Secondary text color
- **Text Tertiary**: `#8792A2` - Tertiary text, labels, placeholders

### Background Colors
- **White**: `#FFFFFF` - Main background
- **Light Gray**: `#F6F8FA` - Secondary background, cards
- **Border Gray**: `#D5DBE1` - Borders and dividers
- **Disabled Gray**: `#D5DBE1` - Disabled button background

### Status Colors
- **Warning**: `#FF9900` - Warning messages and alerts
- **Success Green**: `#9BE8C5` - Availability indicators (both available)
- **Light Green**: `#E8F5EE` - Partial availability indicator

## Typography

### Font Family
- **Primary Font**: `'Inter'` - Used for all text

### Font Weights
- **Normal**: `font-normal` (400)
- **Medium**: `font-medium` (500)
- **Semibold**: `font-semibold` (600)

### Font Sizes
- **12px**: Small labels, badges, secondary info
- **14px**: Body text, buttons, form inputs
- **16px**: Headings, emphasis text
- **24px**: Page titles

### Line Heights
- **18px**: `leading-[18px]` - Tight spacing for small text
- **20px**: `leading-[20px]` - Body text, buttons
- **24px**: `leading-[24px]` - Headings and larger text
- **Normal**: `leading-[normal]` - Default line height

## Spacing

### Gap Sizes
- **4px**: `gap-[4px]` - Minimal spacing within buttons
- **8px**: `gap-[8px]` - Small spacing between elements
- **12px**: `gap-[12px]` - Standard spacing between interactive elements
- **16px**: `gap-[16px]` - Medium spacing
- **20px**: `gap-[20px]` - Large spacing between sections
- **24px**: `gap-[24px]` - XL spacing for major sections
- **36px**: `gap-[36px]` - XXL spacing for major layout divisions

### Padding
- **Button Padding**: `px-[11px] py-[6px]` - Standard button padding
- **Card Padding**: `p-[21px]` or `p-3` (12px) - Card content padding
- **Input Padding**: `px-3 py-2` - Form input padding

## Border Radius

- **Small**: `rounded-[2px]` - Checkboxes, small elements
- **Default**: `rounded-[4px]` - Buttons, cards, inputs, most UI elements
- **Medium**: `rounded-[8px]` - Large cards, containers
- **Full**: `rounded-full` - Avatars, circular elements

## Buttons

### Primary Button
```tsx
className="bg-[#635bff] h-[32px] px-[11px] py-[6px] rounded-[4px] flex items-center justify-center gap-[4px] hover:bg-[#5850e6]"
```
- Background: `#635BFF`
- Hover: `#5850E6`
- Text: White, 14px, medium weight, 20px line-height

### Secondary Button (Outlined)
```tsx
className="bg-white h-[32px] px-[11px] py-[6px] rounded-[4px] border border-[#d5dbe1] flex items-center justify-center gap-[4px] hover:bg-[#f6f8fa]"
```
- Background: White
- Border: `#D5DBE1`
- Hover Background: `#F6F8FA`
- Text: `#8792A2`, 14px, medium weight, 20px line-height

### Disabled Button
```tsx
className="bg-[#d5dbe1] h-[32px] px-[11px] py-[6px] rounded-[4px] cursor-not-allowed"
```
- Background: `#D5DBE1`
- Text: White, 14px, medium weight, 20px line-height

### Button Dimensions
- **Height**: Always `h-[32px]`
- **Padding**: Always `px-[11px] py-[6px]`
- **Border Radius**: Always `rounded-[4px]`
- **Gap**: Always `gap-[4px]` for content spacing

## Cards

### Standard Card
```tsx
className="bg-white border border-[#d5dbe1] rounded-[8px] p-4"
```
- **No shadows** - Cards use borders only for separation

### Background Card
```tsx
className="bg-[#f6f8fa] rounded-[4px] border border-[#d5dbe1] p-3"
```
- **No shadows** - Flat design with borders only

## Avatars

### AI Agent Avatar (Luna)
- Size: `30px` (header) or `40px` (chat)
- Background: Gradient `from-[#7c75ff] to-[#635bff]`
- Icon: Robot icon in white
- Border Radius: `rounded-full`

### User Avatar
- Size: `30px`, `32px`, or `48px` depending on context
- Border Radius: `rounded-full`

## Layout

### Chat Window
- Max Width: `408px`
- Background: White
- Border: `border-[#d5dbe1]`
- Border Radius: `rounded-[8px]`
- **No shadows** - Flat design with borders only

### Header
- Height: `69px`
- Background: `#F6F8FA`
- Border Bottom: `border-[#d5dbe1]`
- Padding: `px-[21px]`

### Content Area
- Padding: `p-[21px]`

## Design Principles

### Flat Design
- **No drop shadows** - The design uses a clean, flat aesthetic
- Separation is achieved through borders and background colors only
- Focus on clean lines and clear visual hierarchy through color and spacing

## Animations

### Motion Transitions
- Use `motion/react` for animations
- Standard Initial: `{ opacity: 0, y: 20 }`
- Standard Animate: `{ opacity: 1, y: 0 }`
- Transition Duration: 0.3-1.5s depending on animation type

## Accessibility

- All buttons must have descriptive text
- All images must have alt text
- Interactive elements must have visible focus states
- Color contrast must meet WCAG AA standards