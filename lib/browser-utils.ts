// Check if code is running in a browser environment
export const isBrowser = (): boolean => {
  return typeof window !== "undefined"
}

// Safe localStorage implementation that works in both browser and server environments
export const safeLocalStorage = () => {
  if (isBrowser()) {
    return window.localStorage
  }

  // Return a mock implementation for server-side rendering
  return {
    getItem: (_key: string) => null,
    setItem: (_key: string, _value: string) => {},
    removeItem: (_key: string) => {},
    clear: () => {},
    key: (_index: number) => null,
    length: 0,
  }
}

// Safe sessionStorage implementation
export const safeSessionStorage = () => {
  if (isBrowser()) {
    return window.sessionStorage
  }

  // Return a mock implementation for server-side rendering
  return {
    getItem: (_key: string) => null,
    setItem: (_key: string, _value: string) => {},
    removeItem: (_key: string) => {},
    clear: () => {},
    key: (_index: number) => null,
    length: 0,
  }
}

// Safe window.navigator implementation
export const safeNavigator = () => {
  if (isBrowser()) {
    return window.navigator
  }

  // Return a mock implementation for server-side rendering
  return {
    userAgent: "",
    language: "",
    languages: [],
    clipboard: {
      writeText: async () => {},
      readText: async () => "",
    },
  } as Navigator
}

// Safe document implementation
export const safeDocument = () => {
  if (isBrowser()) {
    return window.document
  }

  // Return a mock implementation for server-side rendering
  return {} as Document
}
