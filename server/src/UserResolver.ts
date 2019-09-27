import { ObjectType, Resolver, Query, Mutation, Arg, Field, Ctx } from 'type-graphql';
import { hash , compare } from 'bcryptjs';
import { User } from './entity/User'
import {sign} from 'jsonwebtoken';
import { MyContext } from './MyContext';

@ObjectType() 
class LoginResponse {
  @Field()
  accessToken: string
}

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello() {
    return 'hi!';
  }

  @Query(() => [User])
  users() {
    return User.find();
  }

  @Mutation(() => Boolean)
  async register(
    @Arg('email') email: string,
    @Arg('password') password: string,
  ) {

    const hashedPassword = await hash(password,12);

    try {
      await User.insert({
        email,
        password: hashedPassword
      })
    } catch(err) {
      console.log(err);
      return false;
    }

    return true;
  }


  @Mutation(() => LoginResponse)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() {res}: MyContext
  ): Promise<LoginResponse> {

    const user = await User.findOne({ where: {email}});

    if (!user) {
      throw new Error('could not find user');
    }

    const valid = await compare(password, user.password);

    if (!valid) {
      throw new Error('bad password',);
    }

    // login successful
    res.cookie('jid', 
    sign({userId: user.id,} , 'asdfasfasd' , 
    {expiresIn: '7d'}),
    {
      httpOnly: true,
    }
    );

    return {
      accessToken: sign({userId: user.id,} , '1231312312' , {expiresIn: '15m'})
    };
  }
}