export type CategoriesMessages = {
  title: string
  subtitle: string
  newCategory: string
  editCategory: string
  empty: string
  noChildren: string
  searchPlaceholder: string
  typeAll: string
  typeProperty: string
  typeCar: string
  typeLabel: string
  columns: {
    name: string
    type: string
    parent: string
    children: string
    created: string
  }
  actions: {
    edit: string
    delete: string
    addChild: string
  }
  delete: {
    title: string
    description: string
    confirm: string
    success: string
    protected: string
  }
  form: {
    nameLabel: string
    namePlaceholder: string
    typeLabel: string
    parentLabel: string
    parentNone: string
    saveCreate: string
    saveUpdate: string
    validation: {
      nameRequired: string
      nameTooLong: string
      typeRequired: string
    }
  }
  create: {
    success: string
  }
  update: {
    success: string
  }
  loading: string
  errorLoading: string
  breadcrumb: string
  common: {
    loading: string
    error: string
    retry: string
    save: string
    cancel: string
    delete: string
    edit: string
    create: string
    search: string
    next: string
    previous: string
    confirm: string
    close: string
    yes: string
    no: string
    none: string
    required: string
    select: string
  }
}

export const categoriesEn: CategoriesMessages = {
  title: "Categories",
  subtitle: "Manage property and car categories used across the platform.",
  newCategory: "New category",
  editCategory: "Edit category",
  empty: "No categories yet. Create your first category to get started.",
  noChildren: "No subcategories.",
  searchPlaceholder: "Search categories...",
  typeAll: "All types",
  typeProperty: "Property",
  typeCar: "Car",
  typeLabel: "Type",
  columns: {
    name: "Name",
    type: "Type",
    parent: "Parent",
    children: "Subcategories",
    created: "Created",
  },
  actions: {
    edit: "Edit",
    delete: "Delete",
    addChild: "Add subcategory",
  },
  delete: {
    title: "Delete category",
    description:
      "Deleting a category removes it and any empty subcategories. Categories with linked records cannot be removed.",
    confirm: "Delete",
    success: "Category deleted.",
    protected: "This category is protected and cannot be deleted.",
  },
  form: {
    nameLabel: "Name",
    namePlaceholder: "e.g. Apartments",
    typeLabel: "Type",
    parentLabel: "Parent category (optional)",
    parentNone: "No parent (top-level)",
    saveCreate: "Create category",
    saveUpdate: "Save changes",
    validation: {
      nameRequired: "Name is required.",
      nameTooLong: "Name is too long.",
      typeRequired: "Type is required.",
    },
  },
  create: {
    success: "Category created.",
  },
  update: {
    success: "Category updated.",
  },
  loading: "Loading categories...",
  errorLoading: "Failed to load categories.",
  breadcrumb: "Categories",
  common: {
    loading: "Loading...",
    error: "Something went wrong",
    retry: "Retry",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    search: "Search",
    next: "Next",
    previous: "Previous",
    confirm: "Confirm",
    close: "Close",
    yes: "Yes",
    no: "No",
    none: "None",
    required: "Required",
    select: "Select...",
  },
}
