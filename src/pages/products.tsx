/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileDown, Filter, Loader2, MoreHorizontal, Plus, Search } from 'lucide-react'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { MyToasts } from '../utilities/my-toasts'

import * as Dialog from '@radix-ui/react-dialog'
import * as DM from '@radix-ui/react-dropdown-menu'

// import useDebounceValue from '../hooks/use-debounce-value'

import { Format } from '../utilities/format'

import { Main } from '../components/main'
import { Button } from '../components/ui/button'
import { Control, Input } from '../components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Pagination } from '../components/pagination'
import { CreateProductForm } from '../components/create-product-form'

interface IProduct {
  id: string
  name: string
  slug: string
  amount: number
  description: number
}

interface IProductsResponse {
  first: number
  prev: number | null
  next: number | null
  last: number
  pages: number
  items: number
  data: IProduct[]
}

export function Products() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const urlFilter = searchParams.get('filter') ?? ''
  const [filter, setFilter] = useState(urlFilter)

  const page = Number(searchParams.get('page') || 1)
  const perPage = Number(searchParams.get('per_page') || 10)

  const [dialogActive, setDialogActive] = useState(false)

  const format = new Format()
  const mt = new MyToasts()

  const { data: productsResponse, isLoading, isLoadingError } = useQuery<IProductsResponse>({
    queryKey: ['get-products', urlFilter, page, perPage],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3333/products?_page=${page}&_per_page=${perPage}&name=${urlFilter}`)
      const data = await response.json()

      // delay de 2s
      // await new Promise(resolve => setTimeout(resolve, 2000))

      return data
    },
    placeholderData: keepPreviousData, // mantém os dados antigos em tela enquanto faz a requisição
    staleTime: 1000 * 60, // quanto tempo os dados valem, após esse tempo, o useQuery fará a requisição novamente
  })

  function handleFilter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setSearchParams(params => {
      params.set('page', '1')
      params.set('filter', filter)
      return params
    })
  }

  function handleReloadQuery() {
    queryClient.invalidateQueries({
      queryKey: ['get-products']
    })
  }

  function handleChangeDialog() {
    setDialogActive(state => !state)
  }

  if (isLoading) {
    return (
      <div className='w-full h-screen flex justify-center items-center'>
        <Loader2 className='size-14 animate-spin' />
      </div>
    )
  }

  // const { mutateAsync } = useMutation({
  //   mutationFn: async (id: string) => {
  //     // console.log(`{name: ${name.trim()}, amount: ${amount}, description: ${description.trim()}}`)
  //     // alert('foi')
  //     // return
  //     // // delay de 2s
  //     // await new Promise(resolve => setTimeout(resolve, 2000))

  //     await fetch(`http://localhost:3333/products/${id}`, {
  //       method: 'DELETE'
  //     })
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({
  //       queryKey: ['get-products']
  //     })
  //     alert('Removed!')
  //   }
  // })

  async function handleRemoveProduct(id: string) {
    if (confirm('The product will be removed.')) {
      // await mutateAsync(id)
      await fetch(`http://localhost:3333/products/${id}`, {
        method: 'DELETE'
      })
        .then(() => {
          queryClient.invalidateQueries({
            queryKey: ['get-products']
          })
          mt.success('Deletado')
        })
    }
  }

  return (
    <>
      <Main className="max-w-6xl mx-auto py-10 px-4 space-y-5">
        {productsResponse && !isLoadingError ? (
          <>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">Products</h1>
              <Dialog.Root
                open={dialogActive}
                onOpenChange={() => setDialogActive(state => !state)}
              >
                <Dialog.Trigger asChild>
                  <Button variant='primary' className='print:hidden'>
                    <Plus className="size-3" />
                    create new
                  </Button>
                </Dialog.Trigger>

                <Dialog.Portal>
                  <Dialog.Overlay className='fixed inset-0 bg-black/70' />
                  <Dialog.Content className='w-[450px] h-screen overflow-auto fixed p-10 space-y-3 right-0 top-0 bottom-0 z-10 bg-zinc-950 border-l border-zinc-900'>

                    {/* FORM */}
                    <CreateProductForm afterSubmit={handleChangeDialog} />
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </div>

            <div className='flex items-center justify-between print:hidden'>
              <form onSubmit={e => handleFilter(e)} className="flex items-center gap-2">
                <Input variant='filter'>
                  <Search className='size-3' />
                  <Control
                    placeholder='search products...'
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                  />
                </Input>

                <Button type='submit'>
                  <Filter className='size-3' />
                  Apply filters
                </Button>
              </form>

              <Button
                onClick={window.print}
              >
                <FileDown className='size-3' />
                Export
              </Button>
            </div>

            <Pagination pages={productsResponse.pages} items={productsResponse.items} itemsShown={productsResponse.data.length} page={page} perPage={perPage} />

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {productsResponse.data.map(p => {
                  return (
                    <TableRow key={p.id}>
                      <TableCell></TableCell>
                      <TableCell>
                        <div className='flex flex-col gap-0.5'>
                          <span className='font-medium'>
                            <a href={`/product/${p.slug}`} className='hover:underline'>{p.name}</a>
                          </span>
                          <span className='text-xs text-zinc-500 print:text-zinc-800'>
                            <a href={`/product/${p.slug}`} className='hover:underline'>{p.slug}</a>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className='text-zinc-300 print:text-zinc-800'>
                        {format.currency(p.amount, true)}
                      </TableCell>
                      <TableCell className='text-right'>
                        <DM.Root>
                          <DM.Trigger className='p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:border-zinc-700 print:hidden'>
                            {/* <DM.Trigger asChild> */}
                            {/* <Button size='icon'> */}
                            <MoreHorizontal className='size-4' />
                            {/* </Button> */}
                          </DM.Trigger>
                          <DM.Portal>
                            <DM.Content
                              className="min-w-32 bg-zinc-800 rounded-md p-2 space-y-1 shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
                              sideOffset={5}
                              align='end'
                            >
                              {/* <DM.Arrow className='fill-zinc-600' /> */}
                              <DM.Item
                                className='cursor-pointer py-1 px-2 outline-0 rounded font-medium data-[highlighted]:bg-teal-700'
                                onClick={() => alert('test')}
                              >
                                Edit
                              </DM.Item>

                              {/* <DM.Separator className="border-b border-zinc-700 mx-2" /> */}

                              <DM.Item
                                className='cursor-pointer py-1 px-2 outline-0 rounded text-red-400 font-medium data-[highlighted]:bg-red-700'
                                onClick={() => handleRemoveProduct(p.id)}
                              >
                                Remove
                              </DM.Item>
                            </DM.Content>
                          </DM.Portal>
                        </DM.Root>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            <Pagination pages={productsResponse.pages} items={productsResponse.items} itemsShown={productsResponse.data.length} page={page} perPage={perPage} />
          </>
        ) : (
          <>
            <div className='space-y-3 text-center'>
              <p className='text-red-400'>
                Erro ao tentar buscar as informações.
              </p>
              <Button onClick={handleReloadQuery}>
                Recarregar
              </Button>
            </div>
          </>
        )}
      </Main>
      {/* <ToastContainer /> */}
    </>
  )
}