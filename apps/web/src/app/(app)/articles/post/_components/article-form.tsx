'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@web/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@web/components/ui/card"
import { Input } from "@web/components/ui/input"
import { Label } from "@web/components/ui/label"
import { useToast } from "@web/hooks/use-toast"
import { articleSchema } from "@web/server/api/validators"
import { api } from "@web/trpc/react"
import { Loader } from "lucide-react"
import { useRouter } from "next-nprogress-bar"
import { useForm, useFormContext } from 'react-hook-form'
import { type z } from "zod"

// const articleSchema = z.object({
//     title: z.string().min(1, {message: 'Title is required.'}).max(100, {message: "Title must be at most 100 characters long"}),
//     content: z.string().min(150, {message: "Content must be at least 150 characters long"}),
// })

function CreateArticle() {
    const { toast } = useToast()
    const form = useForm<z.infer<typeof articleSchema>>({
        resolver: zodResolver(articleSchema),
    })
    const {
        register,
        formState: { errors },
    } = useFormContext<z.infer<typeof articleSchema>>()
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
            // Redirect to the article page
            router.push(`/articles`)
        } catch (error) {
            console.error("Error creating article", error);

            toast({
                title: "Error creating article",
                description: "There was an error creating your article",
                variant: "destructive",
            })
        }
    }

    return (
        <>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-6">
                <div className="flex justify-end">
                    <div className="flex w-full flex-col items-start gap-2">
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
                    </div>
                    <Button type="submit" className="w-fit" disabled={isPending}>
                        {isPending && <Loader className={`animate-spin`} />}
                        Post Article
                    </Button>
                </div>
            </form>
        </>
    )
}

export default function ArticleForm() {
    return (
        <div className="flex justify-center p-4 mx-auto">
            <Card className="flex flex-col rounded-xl border px-0 shadow-sm">
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
}