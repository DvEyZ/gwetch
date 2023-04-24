import net from 'node:net';
import { URL } from 'node:url';

export enum GopherItemType
{
    text = '0',
    sub = '1',
    ccso = '2',
    error = '3',
    binhex = '4',
    dos = '5',
    uuencode = '6',
    search = '7',
    telnet = '8',
    binary = '9',
    mirror = '+',
    gif = 'g',
    image = 'I',
    telnet3270 = 'T',
    bitmap = ':',
    movie = ';',
    sound = '<',
    doc = 'd',
    html = 'h',
    info = 'i',
    png = 'p',
    rtf = 'r',
    wav = 's',
    pdf = 'P',
    xml = 'X'
}

export interface GopherItem
{
    type :GopherItemType,
    display :string,
    selector :string,
    hostname :string,
    port :string
}

export class GopherResponse
{
    private buf :Buffer;

    constructor(res :Buffer)
    {
        this.buf = res;
    }

    async buffer() :Promise<Buffer>
    {
        return this.buf;
    }

    async blob() :Promise<Blob>
    {
        return new Blob([this.buf]);
    }

    async text() :Promise<string>
    {
        return this.buf.toString();
    }

    async items() :Promise<GopherItem[]>
    {
        let i = this.buf.toString().split('\r\n');
        i.pop();
        if(i[i.length -1] !== '.')
        {
            throw new Error('Invalid body.')
        }
        i.pop();

        return i.map((v) => {
            let type = v[0] as GopherItemType;

            if(!Object.values(GopherItemType).includes(type))
            {
                throw new Error('Invalid item type.')
            }

            v = v.slice(1,v.length);
            let frag = v.split('\t');

            return {
                type: type,
                display: frag[0],
                selector: frag[1],
                hostname: frag[2],
                port: frag[3]
            }
        })
    }
}

export const gwetch = async (url :string) :Promise<GopherResponse> => {
    return new Promise((resolve,reject) => {
        let u = new URL(url);
        if(u.protocol !== 'gopher:')
        {
            reject(new Error('Unsupported scheme.'))
        }
        let data = Buffer.from([]);
        let timeout = setTimeout(() => {
            reject(new Error('Server timeout.'))
        }, 5000);
        let socket :net.Socket = net.connect({host: u.hostname, port: Number(u.port) || 70}, () => {
            socket.write(`${u.pathname}\n`);
            socket.on('data', (d) => {
                data = Buffer.concat([data,d]);
            });
            socket.on('end', () => {
                resolve(new GopherResponse(data));
            })
            socket.on('error', (err) => {
                clearTimeout(timeout);
                reject(err);
            });
        })
    });
}