import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {articleOutline, safeArticleUrl} from './markdown-policy';

export function PublishedMarkdown({body, title, locale}: { body: string; title: string; locale: string }) {
    return <article className="article-content">
        <ReactMarkdown
            skipHtml
            urlTransform={safeArticleUrl}
            remarkPlugins={[remarkGfm, [articleOutline, {
                title,
                locale
            }]]}
            components={{
                pre: ({children}) =>
                    <pre className="article-code"
                         tabIndex={0}>{children}
                    </pre>,
                table: ({children}) =>
                    <div className="metrics-table"
                         role="region"
                         aria-label={locale === 'pt-BR' ? 'Tabela' : 'Table'}
                         tabIndex={0}>
                        <table>{children}</table>
                    </div>,
                img: ({alt = '', ...props}) =>
                    <img {...props}
                         alt={alt}
                         loading="lazy"
                         decoding="async"/>
            }}>
            {body}
        </ReactMarkdown>
    </article>;
}
