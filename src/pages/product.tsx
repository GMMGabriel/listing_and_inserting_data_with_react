import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Undo2 } from "lucide-react";

import { Main } from "../components/main";
import { Button } from "../components/ui/button";
import { Format } from "../utilities/format";

type TParams = {
  slug: string
}

interface IProduct {
  id: string
  name: string
  slug: string
  amount: number
  description: string
}

type TProductResponse = IProduct[]

export function Product() {
  const queryClient = useQueryClient()
  const params = useParams<TParams>()
  const slug = params.slug
  const format = new Format()

  const { data: productResponse, isLoading, isLoadingError } = useQuery<TProductResponse>({
    queryKey: ['get-product-by-slug', slug],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3333/products?slug=${slug}`)
      const data = await response.json()
      console.log('data:', data)
      return data
    },
    staleTime: 1000 * 60, // quanto tempo os dados valem, após esse tempo, o useQuery fará a requisição novamente
  })

  function handleReloadQuery() {
    queryClient.invalidateQueries({
      queryKey: ['get-product-by-slug']
    })
  }

  function handleGoBack() {
    window.history.back()
  }

  if (isLoading) {
    return (
      <div className='w-full h-screen flex justify-center items-center'>
        <Loader2 className='size-14 animate-spin' />
      </div>
    )
  }

  return (
    <Main>
      {productResponse && !isLoadingError ? (
        <>
          <div className="text-center mb-8">
            <Button onClick={handleGoBack}>
              <Undo2 className="size-5" />
              <span className="text-lg">Voltar</span>
            </Button>
          </div>

          <div className="max-w-[500px] w-full p-4 mx-auto border border-zinc-800 rounded-lg space-y-4">
            <h1 className="pb-4 text-3xl border-b border-zinc-800">
              {productResponse[0].name}
            </h1>

            <div className="text-xl text-green-500">
              {format.currency(productResponse[0].amount, true)}
            </div>

            <p className="text-justify">
              {productResponse[0].description}
            </p>
          </div>
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