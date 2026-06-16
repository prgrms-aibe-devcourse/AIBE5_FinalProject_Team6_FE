import { useEffect, useState } from 'react'
import { confirmPayment } from '../api/payments'
import { createOrder } from '../api/orders'

export interface CheckoutData {
  type?: string
  title: string
  price: number
  qty: number
  option: string
  productId: number | null
  accessTicket?: string | null
}

export interface CheckoutForm {
  name: string
  phone1: string
  phone2: string
  phone3: string
  zipcode: string
  req: string
  defaultAddr: boolean
}

export type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed'

const DEFAULT_FORM: CheckoutForm = {
  name: '',
  phone1: '010',
  phone2: '',
  phone3: '',
  zipcode: '',
  req: '부재시 문앞에 놓아주세요',
  defaultAddr: false,
}

export function useCheckout(setActiveTab: (tab: string) => void) {
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>(DEFAULT_FORM)
  const [payMethod, setPayMethod] = useState('toss')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle')
  const [paymentError, setPaymentError] = useState('')

  // Toss 결제 콜백(successUrl/failUrl 리다이렉트) 처리
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paymentKey = params.get('paymentKey')
    // Toss redirects with orderId = the orderPaymentKey string used at payment init
    const tossOrderId = params.get('orderId')
    const amount = params.get('amount')
    const code = params.get('code')
    const message = params.get('message')

    if (paymentKey && tossOrderId && amount) {
      window.history.replaceState({}, '', window.location.pathname)
      const storedOrderId = Number(localStorage.getItem('fd_pending_order_id'))
      localStorage.removeItem('fd_pending_order_id')
      setTimeout(() => {
        setPaymentStatus('processing')
        confirmPayment(paymentKey, storedOrderId, tossOrderId, Number(amount))
          .then(() => {
            setPaymentStatus('success')
            setActiveTab('ORDER_COMPLETE')
          })
          .catch(() => {
            const msg = '결제 확인 중 오류가 발생했습니다. 고객센터에 문의해 주세요.'
            setPaymentStatus('failed')
            setPaymentError(msg)
            alert(msg)
          })
      }, 0)
    } else if (code && code !== 'PAY_PROCESS_CANCELED' && code !== 'USER_CANCEL') {
      window.history.replaceState({}, '', window.location.pathname)
      setTimeout(() => {
        setPaymentStatus('failed')
        setPaymentError(message || '결제가 실패하였습니다.')
      }, 0)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePay = async () => {
    if (!checkoutForm.name || !checkoutForm.phone2 || !checkoutForm.zipcode) {
      alert('필수 정보를 모두 입력해주세요.')
      return
    }
    if (!checkoutData?.productId) {
      alert('상품 정보를 확인할 수 없습니다.')
      return
    }
    const btn = document.getElementById('checkout-btn')
    if (btn) btn.innerHTML = '주문 생성 중... ⏳'
    try {
      const order = await createOrder(
        [{ productId: checkoutData.productId, quantity: checkoutData.qty }],
        checkoutData.accessTicket ?? null,
      )
      localStorage.setItem('fd_pending_order_id', order.orderId)
      const totalAmount = checkoutData.price * checkoutData.qty + 3000
      const { loadTossPayments } = await import('@tosspayments/sdk')
      const tossPayments = await loadTossPayments(
        import.meta.env.VITE_TOSS_CLIENT_KEY || 'test_ck_placeholder',
      )
      await tossPayments.requestPayment('카드', {
        amount: totalAmount,
        orderId: order.orderPaymentKey,
        orderName: checkoutData.title,
        customerName: checkoutForm.name,
        successUrl: `${window.location.origin}${window.location.pathname}`,
        failUrl: `${window.location.origin}${window.location.pathname}`,
      })
    } catch (err: unknown) {
      const tossErr = err as { code?: string; message?: string }
      if (btn)
        btn.innerHTML = `₩${((checkoutData?.price ?? 0) * (checkoutData?.qty ?? 1) + 3000).toLocaleString()} 결제하기`
      if (tossErr?.code !== 'PAY_PROCESS_CANCELED' && tossErr?.code !== 'USER_CANCEL') {
        setPaymentStatus('failed')
        setPaymentError(tossErr?.message || '결제 처리 중 오류가 발생했습니다.')
      }
    }
  }

  const resetCheckout = () => {
    setCheckoutData(null)
    setPaymentStatus('idle')
    setPaymentError('')
  }

  return {
    checkoutData,
    setCheckoutData,
    checkoutForm,
    setCheckoutForm,
    payMethod,
    setPayMethod,
    paymentStatus,
    paymentError,
    handlePay,
    resetCheckout,
  }
}