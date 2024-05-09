import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Loader2, X } from "lucide-react";
import * as Dialog from '@radix-ui/react-dialog'

import generateSlug from '../utilities/slug';

import { Button } from "./ui/button";

const createTagSchema = z.object({
  title: z.string().trim().min(3, { message: 'Minimum 3 characters.' }),
})

type CreateTagSchema = z.infer<typeof createTagSchema>

export function CreateTagForm() {
  const queryClient = useQueryClient()
  
  const { register, handleSubmit, watch, formState } = useForm<CreateTagSchema>({
    resolver: zodResolver(createTagSchema)
  })

  const slug = watch('title')
    ? generateSlug(watch('title'))
    : ''

  const { mutateAsync } = useMutation({
    mutationFn: async ({ title }: CreateTagSchema) => {
      // delay de 2s
      await new Promise(resolve => setTimeout(resolve, 2000))

      await fetch('http://localhost:3333/tags', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          slug,
          amountOfVideos: 0
        })
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['get-tags']
      })
    }
  })

  async function createTag({ title }: CreateTagSchema) {
    await mutateAsync({ title })
  }

  return (
    <form onSubmit={handleSubmit(createTag)} className="w-full space-y-6">
      <div className='space-y-2'>
        <label className="block text-sm font-medium" htmlFor="title">Tag title</label>
        <input
          {...register('title')}
          type="text"
          name="title"
          id="title"
          className="border border-zinc-800 rounded-lg px-3 py-2.5 bg-zinc-800/50 w-full text-sm"
        />
        {formState.errors.title && (
          <p className='text-sm text-red-400'>{formState.errors.title.message}</p>
        )}
      </div>

      <div className='space-y-2'>
        <label className="block text-sm font-medium" htmlFor="slug">slug</label>
        <input
          type="text"
          name="slug"
          id="slug"
          value={slug}
          className="border border-zinc-800 rounded-lg px-3 py-2.5 bg-zinc-800/50 w-full text-sm"
          readOnly
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <Dialog.Close asChild>
          <Button>
            <X className="size-3" />
            Cancel
          </Button>
        </Dialog.Close>

        <Button
          type="submit"
          className="bg-teal-400 text-teal-950"
          disabled={formState.isSubmitting}
        >
          {formState.isSubmitting ? <Loader2 className='size-3 animate-spin' /> : <Check className="size-3" />}
          Save
        </Button>
      </div>
    </form>
  )
}