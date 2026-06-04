import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Populate } from './db/populate';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await Populate();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
