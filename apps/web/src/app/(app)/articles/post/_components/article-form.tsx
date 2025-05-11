/*'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@web/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@web/components/ui/card"
import { Input } from "@web/components/ui/input"
import { Label } from "@web/components/ui/label"
import { Textarea } from "@web/components/ui/textarea"
import { useToast } from "@web/hooks/use-toast"
import { articleSchema } from "@web/server/api/validators"
import { api } from "@web/trpc/react"
import { Loader } from "lucide-react"
import { useRouter } from "next-nprogress-bar"
import { useForm } from 'react-hook-form'
import { type z } from "zod"

function CreateArticle() {
    const { toast } = useToast()
    const form = useForm<z.infer<typeof articleSchema>>({
        resolver: zodResolver(articleSchema),
        defaultValues: {
            title: "",
            content: "",
        },
    })
    const { register, formState: { errors }, handleSubmit } = form
    const { mutateAsync, isPending } = api.articles.createArticle.useMutation()
    const router = useRouter()

    const onSubmit = async (data: z.infer<typeof articleSchema>) => {
        try {
            const article = await mutateAsync(data)
            console.log("Article", article)
            toast({
                title: "Article created successfully",
                description: "Your article has been created successfully",
            })
            form.reset()
            router.push(`/articles`)
        } catch (error) {
            console.error("Error creating article", error)
            toast({
                title: "Error creating article",
                description: "There was an error creating your article",
                variant: "destructive",
            })
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <Label className="text-foreground" htmlFor="title">
                        Article Title
                    </Label>
                    <Input
                        {...register("title")}
                        id="title"
                        placeholder="Enter article title"
                        type="text"
                        className="ps-4"
                    />
                    {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                </div>
                <div className="flex flex-col gap-2">
                    <Label className="text-foreground" htmlFor="content">
                        Article Content
                    </Label>
                    <Textarea
                        {...register("content")}
                        id="content"
                        placeholder="Enter article content (minimum 150 characters)"
                        className="min-h-[200px] p-4"
                    />
                    {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
                </div>
                <Button type="submit" className="w-fit self-end" disabled={isPending}>
                    {isPending && <Loader className="animate-spin mr-2" />}
                    Post Article
                </Button>
            </div>
        </form>
    )
}

export default function ArticleForm() {
    return (
        <div className="flex justify-center p-4 mx-auto">
            <Card className="flex flex-col rounded-xl border px-0 shadow-sm w-full max-w-2xl">
                <CardHeader className="flex w-full items-start border-b px-6 pb-6">
                    <CardTitle className="text-lg font-semibold md:text-xl">
                        Article Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex w-full flex-col items-start gap-6 pt-6 text-foreground">
                    <CreateArticle />
                </CardContent>
            </Card>
        </div>
    )
}*/