import { create } from 'zustand';

// Lightweight cache of the project list so pages (Dashboard, ProjectDetails)
// don't all re-fetch independently. Kept intentionally simple for M1 scope —
// swap for React Query/RTK Query if invalidation logic grows in later
// milestones (e.g. once Kafka-driven live updates arrive in M2+).
export const useProjectStore = create((set) => ({
  projects: [],
  loading: false,
  error: null,

  setProjects: (projects) => set({ projects, loading: false, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),

  upsertProject: (project) =>
    set((state) => {
      const exists = state.projects.some((p) => p.id === project.id);
      return {
        projects: exists
          ? state.projects.map((p) => (p.id === project.id ? project : p))
          : [project, ...state.projects],
      };
    }),

  removeProject: (id) =>
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) })),
}));
