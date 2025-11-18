import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { MediaService } from '../../application/services/media.service';
import { CreateMediaDto, UpdateMediaDto, MediaResponseDto } from '../../application/dtos/media.dto';

@Resolver(() => MediaResponseDto)
export class MediaResolver {
  constructor(private readonly mediaService: MediaService) {}

  @Mutation(() => MediaResponseDto)
  async createMedia(@Args('input') createDto: CreateMediaDto): Promise<MediaResponseDto> {
    return this.mediaService.create(createDto);
  }

  @Query(() => MediaResponseDto)
  async getMedia(@Args('id') id: string): Promise<MediaResponseDto> {
    return this.mediaService.findById(id);
  }

  @Mutation(() => MediaResponseDto)
  async updateMedia(
    @Args('id') id: string,
    @Args('input') updateDto: UpdateMediaDto,
  ): Promise<MediaResponseDto> {
    return this.mediaService.update(id, updateDto);
  }

  @Mutation(() => Boolean)
  async deleteMedia(@Args('id') id: string): Promise<boolean> {
    const result = await this.mediaService.delete(id);
    return result.success;
  }

  @Query(() => [MediaResponseDto])
  async listMedias(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ): Promise<MediaResponseDto[]> {
    const result = await this.mediaService.findAll(page, limit);
    return result.medias;
  }

  @Query(() => [MediaResponseDto])
  async getMediasByUserId(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ): Promise<MediaResponseDto[]> {
    const result = await this.mediaService.findByUserId(userId, page, limit);
    return result.medias;
  }

  @Query(() => [MediaResponseDto])
  async getMediasByType(
    @Args('mediaType', { type: () => Int }) mediaType: number,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ): Promise<MediaResponseDto[]> {
    const result = await this.mediaService.findByMediaType(mediaType, page, limit);
    return result.medias;
  }
}

