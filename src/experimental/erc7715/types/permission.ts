export type Permission = {
  /** Data of the permission. */
  data: unknown
  /** Type of the permission. */
  type: string
   /** Whether or not the permission can be adjusted by the user. */
   isAdjustmentAllowed: boolean
}
