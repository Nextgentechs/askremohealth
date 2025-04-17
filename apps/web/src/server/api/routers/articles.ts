import { ArticleService } from "@web/server/services/articles";
import { procedure, publicProcedure } from "../trpc";
import { articleListSchema, articleSchema } from "../validators";
import { log } from "node:console";

export const listArticles = publicProcedure
    .input(articleListSchema)
    .query(async ({ input }) => {
        log("input", input);
        return await ArticleService.getArticles(input);
    })

export const createArticle = procedure
    .input(articleSchema)
    .mutation(async ({ ctx, input }) => {
        const userId = ctx.user?.id ?? "";
        const article = await ArticleService.createArticle(input, userId);
        return article;
    })