import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Loader2, X } from "lucide-react";
import * as Dialog from '@radix-ui/react-dialog'

import generateSlug from '../utilities/slug';
import { Format } from '../utilities/format';

import { Button } from "./ui/button";

const createProductSchema = z.object({
  name: z.string()
    .trim()
    .min(3, { message: 'Minimum 3 characters.' })
    .max(50, 'Maximum 50 characters.'),
  amount: z.coerce.number({
    required_error: 'teste teste teste.',
    invalid_type_error: 'Enter a value.',
  })
    .nonnegative('It must be positive')
    .gt(0, 'Must be greater than 0 (zero).'),
  description: z.string()
    .trim()
    .min(10, { message: 'Minimum 10 characters.' })
    .max(200, 'Maximum 200 characters.'),
})

type CreateProductSchema = z.infer<typeof createProductSchema>

export function CreateProductForm() {
  const format = new Format()

  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState,
    control,
  } = useForm<CreateProductSchema>({
    resolver: zodResolver(createProductSchema)
  })

  const slug = watch('name')
    ? generateSlug(watch('name'))
    : ''

  const { mutateAsync } = useMutation({
    mutationFn: async ({ name, amount, description }: CreateProductSchema) => {
      // console.log(`{name: ${name.trim()}, amount: ${amount}, description: ${description.trim()}}`)
      // alert('foi')
      // return
      // // delay de 2s
      // await new Promise(resolve => setTimeout(resolve, 2000))

      await fetch('http://localhost:3333/products', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          slug,
          amount,
          description: description.trim(),
        })
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['get-products']
      })
      // Reseta o formulário
      reset({ name: '', amount: undefined, description: '' })
    }
  })

  async function createProduct({ name, amount, description }: CreateProductSchema) {
    await mutateAsync({ name, amount, description })
  }

  return (
    <>
      <div className="space-y-3">
        <Dialog.Title className='text-xl font-bold'>
          Create product
        </Dialog.Title>

        <Dialog.Description className='text-sm text-zinc-500'>
          A product access link will be created automatically:
        </Dialog.Description>

        <p className='text-sm'>
          {/* {window.location.href.slice(0, window.location.href.indexOf('?'))}/product/{slug} */}
          {window.location.protocol}//{window.location.hostname}:{window.location.port}/product/{slug}
        </p>
      </div>

      <form onSubmit={handleSubmit(createProduct)} className="w-full space-y-6">
        <div className='space-y-2'>
          <label className="block text-sm font-medium" htmlFor="name">Product name</label>
          <input
            {...register('name')}
            type="text"
            name="name"
            id="name"
            maxLength={50}
            className="border border-zinc-800 rounded-lg px-3 py-2.5 bg-zinc-800/50 w-full text-sm"
          />
          {formState.errors.name && (
            <p className='text-sm text-red-400'>{formState.errors.name.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <label className="block text-sm font-medium" htmlFor="amount">Amount</label>
          <Controller
            name='amount'
            control={control}
            render={({ field }) => (
              <input
                type="text"
                id="amount"
                value={field.value ? format.currencyInInput(field.value) : ''}
                maxLength={18}
                onChange={e => {
                  let temp = e.target.value.replace(/[^0-9]/g, '')
                  if (temp.length > 2) {
                    temp = temp.slice(0, -2) + '.' + temp.slice(-2)
                  }
                  field.onChange(temp)
                }}
                className="border border-zinc-800 rounded-lg px-3 py-2.5 bg-zinc-800/50 w-full text-sm"
              />

            )}
          />
          {formState.errors.amount && (
            <p className='text-sm text-red-400'>{formState.errors.amount.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <label className="block text-sm font-medium" htmlFor="description">Description</label>
          <textarea
            {...register('description')}
            name="description"
            id="description"
            maxLength={200}
            className="h-40 border border-zinc-800 rounded-lg px-3 py-2.5 bg-zinc-800/50 w-full text-sm"
          ></textarea>
          {formState.errors.description && (
            <p className='text-sm text-red-400'>{formState.errors.description.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            type="submit"
            className="bg-teal-400 text-teal-950 order-last"
            disabled={formState.isSubmitting}
          >
            {formState.isSubmitting ? <Loader2 className='size-3 animate-spin' /> : <Check className="size-3" />}
            Save
          </Button>

          <Dialog.Close asChild>
            <Button>
              <X className="size-3" />
              Cancel
            </Button>
          </Dialog.Close>
        </div>
      </form>
    </>
  )
}