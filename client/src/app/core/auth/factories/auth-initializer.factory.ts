import { AuthService } from '../auth.service'

export const authInitializerFactory = (authService: AuthService): () => Promise<void> => () => authService.login();