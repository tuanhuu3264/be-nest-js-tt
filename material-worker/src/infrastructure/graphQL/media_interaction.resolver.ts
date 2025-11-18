import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { MediaInteractionService } from '../../application/services/media_interaction.service';
import { CreateMediaInteractionDto, UpdateMediaInteractionDto, MediaInteractionResponseDto } from '../../application/dtos/media_interaction.dto';

@Resolver(() => MediaInteractionResponseDto)
export class MediaInteractionResolver {
  constructor(private readonly mediaInteractionService: MediaInteractionService) {}

  @Mutation(() => MediaInteractionResponseDto)
  async createMediaInteraction(
    @Args('input') createDto: CreateMediaInteractionDto,
  ): Promise<MediaInteractionResponseDto> {
    return this.mediaInteractionService.create(createDto);
  }

  @Query(() => MediaInteractionResponseDto)
  async getMediaInteraction(@Args('id') id: string): Promise<MediaInteractionResponseDto> {
    return this.mediaInteractionService.findById(id);
  }

  @Mutation(() => MediaInteractionResponseDto)
  async updateMediaInteraction(
    @Args('id') id: string,
    @Args('input') updateDto: UpdateMediaInteractionDto,
  ): Promise<MediaInteractionResponseDto> {
    return this.mediaInteractionService.update(id, updateDto);
  }

  @Mutation(() => Boolean)
  async deleteMediaInteraction(@Args('id') id: string): Promise<boolean> {
    const result = await this.mediaInteractionService.delete(id);
    return result.success;
  }

  @Query(() => [MediaInteractionResponseDto])
  async listMediaInteractions(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ): Promise<MediaInteractionResponseDto[]> {
    const result = await this.mediaInteractionService.findAll(page, limit);
    return result.interactions;
  }

  @Query(() => [MediaInteractionResponseDto])
  async getMediaInteractionsByMediaId(
    @Args('mediaId') mediaId: string,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ): Promise<MediaInteractionResponseDto[]> {
    const result = await this.mediaInteractionService.findByMediaId(mediaId, page, limit);
    return result.interactions;
  }

  @Query(() => [MediaInteractionResponseDto])
  async getMediaInteractionsByUserId(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ): Promise<MediaInteractionResponseDto[]> {
    const result = await this.mediaInteractionService.findByUserId(userId, page, limit);
    return result.interactions;
  }
}

