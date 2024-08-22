import { toast } from 'react-toastify'

export class MyToasts {
  success(text: string = 'Sucesso') {
    toast.success(text, {
      autoClose: 3000,
      position: 'top-right',
      theme: 'dark'
    })
  }
}