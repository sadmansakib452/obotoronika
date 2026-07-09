# Frontend 02: কম্পোনেন্ট আর্কিটেকচার (~95 Vue Files)

## ডিরেক্টরি স্ট্রাকচার

```
app/components/
├── atoms/                          ← Small reusable UI primitives
│   ├── ActionButton.vue
│   ├── Icon.vue, Logo.vue
│   ├── Product.vue
│   ├── products/Product.vue
│   ├── SectionTitle.vue
│   ├── skeleton/Product.vue        ← Skeleton loader
│   ├── StickyHeader.vue
│   └── widget-card.vue
│
├── ui/                             ← shadcn-vue primitives (9 sets)
│   ├── avatar/                     Avatar, AvatarFallback, AvatarImage
│   ├── button/                     Button
│   ├── command/                    Command, CommandInput, CommandList, etc. (8 files)
│   ├── dialog/                     Dialog, DialogContent, DialogTrigger, etc. (8 files)
│   ├── drawer/                     Drawer, DrawerContent, etc. (6 files)
│   ├── pin-input/                  PinInput, PinInputGroup, etc. (4 files)
│   ├── popover/                    Popover, PopoverContent, PopoverTrigger
│   ├── scroll-area/                ScrollArea, ScrollBar
│   └── tags-input/                 TagsInput, TagsInputInput, etc. (5 files)
│
├── Auth/                           ← Authentication components
│   ├── index.vue                   Login form
│   ├── SignUp.vue                  Registration form
│   └── SocialLogin.vue             Facebook/Google OAuth buttons
│
├── Cart/                           ← Shopping cart
│   ├── CartSummary.vue             Cart totals
│   └── Products.vue                Cart line items
│
├── Shipping/                       ← Shipping
│   ├── Products.vue                Order items for shipping
│   └── Summary.vue                 Cost summary
│
├── product-details/                ← Product detail page (10 files)
│   ├── ActionButtons.vue           Add to cart/wishlist
│   ├── AverageRatings.vue
│   ├── DeliveryOptions.vue
│   ├── Description.vue
│   ├── ImageGallery.vue
│   ├── RatingReviews.vue
│   ├── Related.vue                 Related products
│   ├── SelectColor.vue / SelectSize.vue
│   └── Variants/
│       ├── Index.vue, ColorPicker.vue, SizePicker.vue, colors.ts
│
├── home/                           ← Homepage sections
│   ├── Banner.vue, FeaturedProducts.vue
│   ├── NewArrivals.vue, Sections.vue, SectionTwo.vue
│   └── styles/ (4 CSS files)
│
├── customer/                       ← Customer dashboard (7 subdirs, ~22 files)
│   ├── address/   AddressForm.vue, helper.ts, index.vue
│   ├── orders/    All.vue, Cancelled.vue, Delivered.vue, index.vue,
│   │              OrderItem.vue, OrderMobileCard.vue, Processing.vue,
│   │              Returned.vue, Shipped.vue
│   ├── profile/   ChangePassword.vue, EditProfile.vue
│   ├── returns/   RequestReturnButton.vue, ReturnForm.vue
│   ├── reviews/   CreateReview.vue, index.vue, Item.vue, ToReview.vue
│   ├── settings/  AccountControl.vue, Language.vue, Notification.vue,
│   │              Privacy.vue, Security.vue
│   └── wishlist/  index.vue
│
├── dashboard/                      ← Admin dashboard (11 subdirs, ~16+ files)
│   ├── analytics/  BandwidthUsageWidget.vue, cloudflare.vue, profit-widget.vue,
│   │               stat-cards.vue, UserLocation.vue, users-state.vue, welcome.vue
│   ├── categories/ Form.vue
│   ├── finance/    InvoiceDetailsTable.vue, transaction-details.vue
│   ├── merchants/  MerchantsForm.vue
│   ├── orders/     DetailsTable.vue, Table.vue
│   ├── products/   ProductForm.vue, helper.ts, styles/,
│   │               types/formType.ts, Variants/index.vue, Variants/Option.vue
│   ├── returns/    ReturnsTable.vue
│   ├── settings/   LoggedDevices.vue, Navigators.vue
│   ├── user/       Form.vue
│   └── web-management/
│       ├── BannerForm.vue, BannerManagement.vue
│       ├── SectionForm.vue, SectionManagement.vue
│       └── index.css
│
├── layouts/                        ← Layout components (3 subdirs)
│   ├── default/   Header.vue, HeaderBottom.vue, HeaderTop.vue, footer.vue,
│   │              index.vue, Menu.vue, Search.vue, UserMenu.vue,
│   │              Mobile/ (2 files), Sidebar/ (1 file), privacy-policy.vue
│   ├── customer/  index.vue, indexx.vue
│   └── dashboard/ Header.vue, hamburger-button.vue, index.vue, Notification.vue,
│                  ProfileActions.vue, RightMenu.vue, SearchWidget.vue,
│                  Sidebar.vue, SidebarMenu.vue
│
├── payment-methods/                ← Payment forms
│   ├── Bkash.vue, Cash.vue, Nagad.vue
│
├── variants/                       ← Variant management
│   ├── AddOption.vue, AddVariant.vue, index.vue
│   └── fields/Color.vue, Size.vue
│
├── skeletons/                      ← Loading skeletons
│   ├── dashboard/invoiceDetails.vue
│   └── dashboard/transactionDetails.vue
│
└── Root-level (10 standalone)
    ├── ActiveNavButton.vue, AddressSidebar.vue
    ├── CustomCard.vue, DatePicker.vue
    ├── Preloader.vue, RatingProgressBar.vue
    ├── ReviewCard.vue, ScrollToTop.vue
    ├── TextEditor.vue, Toolbar.vue
```

## Key Patterns

| Pattern | Description |
|---------|-------------|
| **Feature grouping** | কম্পোনেন্ট তাদের ফিচার অনুযায়ী গ্রুপ করা (customer/, dashboard/, product-details/) |
| **shadcn-vue** | Headless UI primitives (dialog, drawer, command) — copy-paste based, fully customizable |
| **No global UI** | `ui.global: false` → সব UI কম্পোনেন্ট explicit import (`#components`) |
| **Skeletons** | `skeletons/` ফোল্ডারে পৃথক লোডিং স্কেলিটন |
| **Helper files** | `.ts` helper ফাইলগুলো Vue কম্পোনেন্টের সাথে (helper.ts, colors.ts, formType.ts) |
| **Form components** | Dashboard CRUD-এর জন্য আলাদা Form কম্পোনেন্ট (ProductForm.vue, MerchantsForm.vue, Form.vue) |
