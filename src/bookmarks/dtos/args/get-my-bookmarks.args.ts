import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class GetMyBookmarksArgs {
    @Field()
    @IsNotEmpty()
    @IsString()
    userId:string
}
