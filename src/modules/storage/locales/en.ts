export type StorageMessages = {
  title: string
  subtitle: string
  breadcrumbs: {
    root: string
  }
  actions: {
    newFolder: string
    newTextFile: string
    uploadImage: string
    rename: string
    move: string
    delete: string
    download: string
    edit: string
    back: string
    upgrade: string
  }
  empty: {
    folder: string
    files: string
  }
  columns: {
    name: string
    type: string
    size: string
    updated: string
  }
  folderType: string
  textType: string
  imageType: string
  storage: {
    title: string
    used: string
    of: string
    remaining: string
    exceeded: string
    nearLimit: string
    upgradeTitle: string
    upgradeDescription: string
    selectPackage: string
    currentPackage: string
    free: string
    small: string
    medium: string
    large: string
    max: string
    upgrade: string
    upgradeSuccess: string
  }
  folderDialog: {
    title: string
    description: string
    nameLabel: string
    namePlaceholder: string
    parentLabel: string
    parentNone: string
    saveCreate: string
    saveUpdate: string
    validation: {
      nameRequired: string
      nameTooLong: string
    }
  }
  fileDialog: {
    title: string
    description: string
    nameLabel: string
    namePlaceholder: string
    contentLabel: string
    contentPlaceholder: string
    saveCreate: string
    saveUpdate: string
    upload: string
    validation: {
      nameRequired: string
      nameTooLong: string
      contentTooLong: string
    }
  }
  delete: {
    folderTitle: string
    folderDescription: string
    fileTitle: string
    fileDescription: string
    confirm: string
    success: string
    protected: string
  }
  toast: {
    folderCreated: string
    folderRenamed: string
    folderMoved: string
    folderDeleted: string
    fileCreated: string
    fileUpdated: string
    fileMoved: string
    fileRenamed: string
    fileDeleted: string
  }
  loading: string
  errorLoading: string
  storageError: string
  common: {
    loading: string
    error: string
    save: string
    cancel: string
    delete: string
    edit: string
    create: string
    search: string
    confirm: string
    close: string
    none: string
    select: string
  }
}

export const storageEn: StorageMessages = {
  title: "Storage",
  subtitle: "Browse folders, manage files, and monitor your storage quota.",
  breadcrumbs: {
    root: "My files",
  },
  actions: {
    newFolder: "New folder",
    newTextFile: "New text file",
    uploadImage: "Upload image",
    rename: "Rename",
    move: "Move",
    delete: "Delete",
    download: "Open",
    edit: "Edit",
    back: "Back",
    upgrade: "Upgrade",
  },
  empty: {
    folder: "This folder is empty.",
    files: "No files match this view.",
  },
  columns: {
    name: "Name",
    type: "Type",
    size: "Size",
    updated: "Updated",
  },
  folderType: "Folder",
  textType: "Text",
  imageType: "Image",
  storage: {
    title: "Storage quota",
    used: "Used",
    of: "of",
    remaining: "Remaining",
    exceeded: "Storage limit reached. Upgrade to keep uploading files.",
    nearLimit: "Heads up — only a little space left.",
    upgradeTitle: "Upgrade storage",
    upgradeDescription:
      "Pick a larger plan to keep creating folders and uploading files.",
    selectPackage: "Select a package",
    currentPackage: "Current",
    free: "Free",
    small: "Small",
    medium: "Medium",
    large: "Large",
    max: "Maximum",
    upgrade: "Upgrade",
    upgradeSuccess: "Storage plan updated.",
  },
  folderDialog: {
    title: "New folder",
    description: "Create a folder to organize your files.",
    nameLabel: "Folder name",
    namePlaceholder: "e.g. Contracts",
    parentLabel: "Parent folder",
    parentNone: "Root (top-level)",
    saveCreate: "Create folder",
    saveUpdate: "Save changes",
    validation: {
      nameRequired: "Name is required.",
      nameTooLong: "Name is too long.",
    },
  },
  fileDialog: {
    title: "New text file",
    description: "Write a quick note — the file is stored in your account.",
    nameLabel: "File name",
    namePlaceholder: "notes.txt",
    contentLabel: "Content",
    contentPlaceholder: "Type the file content here...",
    saveCreate: "Create file",
    saveUpdate: "Save changes",
    upload: "Upload",
    validation: {
      nameRequired: "Name is required.",
      nameTooLong: "Name is too long.",
      contentTooLong: "Content is too long.",
    },
  },
  delete: {
    folderTitle: "Delete folder",
    folderDescription:
      "Folders that are empty (or contain only safe files) can be removed. Protected folders cannot be deleted.",
    fileTitle: "Delete file",
    fileDescription:
      "Are you sure you want to delete this file? This cannot be undone.",
    confirm: "Delete",
    success: "Deleted.",
    protected: "This folder is protected and cannot be deleted.",
  },
  toast: {
    folderCreated: "Folder created.",
    folderRenamed: "Folder renamed.",
    folderMoved: "Folder moved.",
    folderDeleted: "Folder deleted.",
    fileCreated: "File created.",
    fileUpdated: "File updated.",
    fileMoved: "File moved.",
    fileRenamed: "File renamed.",
    fileDeleted: "File deleted.",
  },
  loading: "Loading storage...",
  errorLoading: "Failed to load storage.",
  storageError: "Failed to load storage info.",
  common: {
    loading: "Loading...",
    error: "Something went wrong",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    search: "Search",
    confirm: "Confirm",
    close: "Close",
    none: "None",
    select: "Select...",
  },
}
