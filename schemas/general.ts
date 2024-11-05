import { Expose } from "class-transformer";
import { Example } from "./utils";

export class SiteDetailSchema {
    @Example('E-STORE')
    @Expose()
    name?: string;

    @Example('kayprogrammer1@gmail.com')
    @Expose()
    email?: string;

    @Example('+2348133831036')
    @Expose()
    phone?: string;

    @Example('234, Lagos, Nigeria')
    @Expose()
    address?: string;

    @Example('https://facebook.com')
    @Expose()
    fb?: string;

    @Example('https://twitter.com')
    @Expose()
    tw?: string;

    @Example('https://wa.me/2348133831036')
    @Expose()
    wh?: string;

    @Example('https://instagram.com')
    @Expose()
    ig?: string;
}