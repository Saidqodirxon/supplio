import { Controller, Get, Post, Param, Query } from "@nestjs/common";
import { PublicService } from "./public.service";

@Controller("public")
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get("home")
  getHome() {
    return this.publicService.getHomeData();
  }

  @Get("tariffs")
  getTariffs() {
    return this.publicService.getTariffs();
  }

  @Get("content")
  getContent() {
    return this.publicService.getContent();
  }

  @Get("news")
  getNewsList(
    @Query("lang") lang: string = "uz",
    @Query("limit") limit?: string
  ) {
    return this.publicService.getNewsList(lang, limit ? Number(limit) : 20);
  }

  @Get("news/:slug")
  getNews(@Param("slug") slug: string, @Query("lang") lang: string = "uz") {
    return this.publicService.getNewsBySlug(slug, lang);
  }

  @Get("legal/:type")
  getLegal(
    @Param("type") type: string,
    @Query("lang") lang: string = "uz"
  ) {
    return this.publicService.getLegalContent(type, lang);
  }

  @Post("news/:id/view")
  incrementView(@Param("id") id: string) {
    return this.publicService.incrementNewsView(id);
  }
}
