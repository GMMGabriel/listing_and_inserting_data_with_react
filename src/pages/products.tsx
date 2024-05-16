import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileDown, Filter, Loader2, MoreHorizontal, Plus, Search } from 'lucide-react'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'

import * as Dialog from '@radix-ui/react-dialog'

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

  const format = new Format()

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

  if (isLoading) {
    return (
      <div className='w-full h-screen flex justify-center items-center'>
        <Loader2 className='size-14 animate-spin' />
      </div>
    )
  }

  return (
    <Main className="max-w-6xl mx-auto py-10 px-4 space-y-5">
      {productsResponse && !isLoadingError ? (
        <>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">Products</h1>
            <Dialog.Root>
              <Dialog.Trigger asChild>
                <Button variant='primary'>
                  <Plus className="size-3" />
                  create new
                </Button>
              </Dialog.Trigger>

              <Dialog.Portal>
                <Dialog.Overlay className='fixed inset-0 bg-black/70' />
                <Dialog.Content className='w-[450px] h-screen overflow-auto fixed p-10 space-y-3 right-0 top-0 bottom-0 z-10 bg-zinc-950 border-l border-zinc-900'>

                  {/* FORM */}
                  <CreateProductForm />
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>

          <div className='flex items-center justify-between'>
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

            <Button>
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
                        <span className='text-xs text-zinc-500'>
                          <a href={`/product/${p.slug}`} className='hover:underline'>{p.slug}</a>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='text-zinc-300'>
                      {format.currency(p.amount, true)}
                    </TableCell>
                    <TableCell className='text-right'>
                      <Button size='icon'>
                        <MoreHorizontal className='size-4' />
                      </Button>
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
  )
}