export type Database = {
  public: {
    Functions: {
      cancel_order_and_restore_stock: {
        Args: {
          order_id_input: number
        }
        Returns: string
      }
    }
  }
}
