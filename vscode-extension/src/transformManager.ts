import * as crypto from 'crypto';

export class TransformManager {
    async transform(text: string, type: string): Promise<string> {
        switch (type) {
            case 'lowercase':
                return text.toLowerCase();
            case 'uppercase':
                return text.toUpperCase();
            case 'titlecase':
                return this.toTitleCase(text);
            case 'camelcase':
                return this.toCamelCase(text);
            case 'snakecase':
                return this.toSnakeCase(text);
            case 'kebabcase':
                return this.toKebabCase(text);
            case 'pascalcase':
                return this.toPascalCase(text);
            case 'base64-encode':
                return Buffer.from(text).toString('base64');
            case 'base64-decode':
                return Buffer.from(text, 'base64').toString('utf-8');
            case 'url-encode':
                return encodeURIComponent(text);
            case 'url-decode':
                return decodeURIComponent(text);
            case 'sha256':
                return crypto.createHash('sha256').update(text).digest('hex');
            case 'reverse':
                return text.split('').reverse().join('');
            case 'sort-lines':
                return text.split('\n').sort().join('\n');
            default:
                throw new Error(`Unknown transform type: ${type}`);
        }
    }

    async format(text: string, type: string): Promise<string> {
        switch (type) {
            case 'json-beautify':
                return JSON.stringify(JSON.parse(text), null, 2);
            case 'json-minify':
                return JSON.stringify(JSON.parse(text));
            case 'sql-format':
                return this.formatSQL(text);
            case 'xml-format':
                return this.formatXML(text);
            case 'html-format':
                return this.formatHTML(text);
            case 'css-format':
                return this.formatCSS(text);
            default:
                throw new Error(`Unknown format type: ${type}`);
        }
    }

    private toTitleCase(text: string): string {
        return text.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    private toCamelCase(text: string): string {
        return text
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
                return index === 0 ? word.toLowerCase() : word.toUpperCase();
            })
            .replace(/\s+/g, '')
            .replace(/[-_]/g, '');
    }

    private toSnakeCase(text: string): string {
        return text
            .replace(/\W+/g, ' ')
            .split(/ |\B(?=[A-Z])/)
            .map((word) => word.toLowerCase())
            .join('_');
    }

    private toKebabCase(text: string): string {
        return text
            .replace(/\W+/g, ' ')
            .split(/ |\B(?=[A-Z])/)
            .map((word) => word.toLowerCase())
            .join('-');
    }

    private toPascalCase(text: string): string {
        return text
            .replace(/\W+/g, ' ')
            .split(/ |\B(?=[A-Z])/)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');
    }

    private formatSQL(sql: string): string {
        const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 
                         'INNER JOIN', 'ON', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 
                         'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'UPDATE', 'DELETE'];
        
        let formatted = sql;
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            formatted = formatted.replace(regex, `\n${keyword}`);
        });
        
        return formatted.trim();
    }

    private formatXML(xml: string): string {
        const PADDING = '  ';
        const reg = /(>)(<)(\/*)/g;
        let formatted = '';
        let pad = 0;

        xml = xml.replace(reg, '$1\n$2$3');
        xml.split('\n').forEach((node) => {
            let indent = 0;
            if (node.match(/.+<\/\w[^>]*>$/)) {
                indent = 0;
            } else if (node.match(/^<\/\w/)) {
                if (pad !== 0) {
                    pad -= 1;
                }
            } else if (node.match(/^<\w([^>]*[^/])?>.*$/)) {
                indent = 1;
            }

            formatted += PADDING.repeat(pad) + node + '\n';
            pad += indent;
        });

        return formatted.trim();
    }

    private formatHTML(html: string): string {
        return this.formatXML(html);
    }

    private formatCSS(css: string): string {
        let formatted = css.replace(/\s*{\s*/g, ' {\n  ');
        formatted = formatted.replace(/;\s*/g, ';\n  ');
        formatted = formatted.replace(/\s*}\s*/g, '\n}\n');
        return formatted.trim();
    }
}
