import { Order } from "../data/PortalEntities";
import BaseApiService from "./BaseApiService";

export default class OrdersApiService {

  static async getOrders(filterOptions?: { needByStartDate?: string, needByEndDate?: string, orderStartDate?: string, orderEndDate?: string }): Promise<Order[]> {
    const queryParams = [] as string[]
    if (filterOptions?.needByStartDate !== undefined)
      queryParams.push('needByStartDate=' + filterOptions.needByStartDate)
    if (filterOptions?.needByEndDate !== undefined)
      queryParams.push('needByEndDate=' + filterOptions.needByEndDate)
    if (filterOptions?.orderStartDate !== undefined)
      queryParams.push('orderStartDate=' + filterOptions.orderStartDate)
    if (filterOptions?.orderEndDate !== undefined)
      queryParams.push('orderEndDate=' + filterOptions.orderEndDate)
    return await BaseApiService.apiGet<Order[]>(`/orders${filterOptions === undefined ? '' : `?${queryParams.join('&')}`}`);
  }

  static async createOrder(order: Order): Promise<number> {
    return await BaseApiService.apiSendJSONAndGet('/orders', 'POST', order, undefined, undefined, undefined, true)
  }

  static async updateOrder(order: Order, orderId: number): Promise<number> {
    return await BaseApiService.apiSendJSONAndGet(`/orders/${orderId}`, 'PUT', order, undefined, undefined, undefined, true)
  }

  static async getOrder(orderId: any): Promise<Order> {
    return await BaseApiService.apiGet<Order>(`/orders/${orderId}`);
  }

}
