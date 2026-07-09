// Input category type (from `data`)
type Category = {
  id: number
  name: string
  slug: string
  parent_id: number | null
  deleted_at: string | null
}

// Output menu item types
type MenuItemBase = {
  label: string
}

type MenuItemLink = MenuItemBase & {
  href: string
}

type MenuItemGroup = MenuItemBase & {
  children: MenuItem[]
}

type MenuItem = MenuItemLink | MenuItemGroup

const buildMenu = (parentId: number | null, data: Category[]): MenuItem[] => {
  return data
    .filter(cat => cat.parent_id === parentId && !cat.deleted_at)
    .map((category) => {
      const children = buildMenu(category.id, data)
      return children.length > 0
        ? { label: category.name, children }
        : { label: category.name, href: `/${category.slug}` }
    })
}

export default buildMenu
