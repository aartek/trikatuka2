export type Params = { limit: number, offset?: number }
export type Stats<A> = { succeeded: A[], failed: A[] }
export type OperationResult<A> = { success: Boolean, item: A }
