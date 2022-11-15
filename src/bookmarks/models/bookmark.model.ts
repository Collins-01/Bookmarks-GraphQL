import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Bookmark{
    @Field()
    name:string;

    @Field()
    description:string;

    @Field()
    link: string;

    @Field()
    userId: string;
}