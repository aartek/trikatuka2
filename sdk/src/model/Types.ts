export type Params = { limit: number, offset?: number, [key: string]: unknown }
export type AlbumGetParams = { type?: string, after?: string } & Params
export type Stats<A> = { succeeded: A[], failed: A[] }
export type OperationResult<A> = { success: Boolean, item: A }
export type Page<A> = { items: A[], total: number }
export type AuthData = { accessToken: string }
export type UserType = 'SOURCE_USER' | 'TARGET_USER'
