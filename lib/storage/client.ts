// Mock Supabase client for MVP
export const supabase = {
  storage: {
    from: () => ({
      upload: async () => ({ data: { path: 'mock-path' }, error: null }),
      download: async () => ({ data: new Blob(), error: null }),
      remove: async () => ({ data: [], error: null }),
      getPublicUrl: () => ({ data: { publicUrl: 'https://mock-url.com' } }),
    }),
  },
}

// Service role client for admin operations
export const supabaseAdmin = supabase