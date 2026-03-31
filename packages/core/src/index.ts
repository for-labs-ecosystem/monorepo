// @forlabs/core — Ecosystem shared business logic barrel export

// Config & Provider
export { EcosystemProvider, useEcosystem } from './EcosystemProvider'
export { TOKEN_KEY, CART_STORAGE_KEY, FAVORITES_STORAGE_KEY } from './constants'

// Auth
export { AuthProvider, useMemberAuth, parseFavoriteIds, type MemberProfile } from './auth'

// Cart
export { CartProvider, useCart, type CartItem } from './cart'

// Favorites
export { FavoritesProvider, useFavorites, type FavoriteItem } from './favorites'

// Query Client
export { createQueryClient } from './queryClient'

// API functions
export {
    getProducts,
    getProduct,
    getArticles,
    getArticle,
    getServices,
    getService,
    getCategories,
    getPages,
    getPage,
    getNavigations,
    getProjects,
    getProject,
    submitInquiry,
    initializeCheckout,
    getWizardSteps,
    postMatch,
    getSites,
    type WizardStepData,
    type WizardStepOption,
    type MatchProduct,
    type MatchArticle,
    type MatchStepInput,
    type MatchCriteria,
    type MatchResponse,
} from './api'

// Hooks
export {
    useProducts,
    useProduct,
    useCategories,
    useArticles,
    useArticle,
    useServices,
    useService,
    useWizardSteps,
} from './hooks'
