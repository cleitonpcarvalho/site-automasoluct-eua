import type { BlogPost } from './types.ts';
import { inlineLinks, safeHref } from './rich-text.ts';
import { IMAGE_WORKFLOW_POLICY, IMAGE_WORKFLOW_STEPS, isImagePlaceholder } from './image-workflow.ts';
import { IMAGE_GENERATION_INSTRUCTIONS } from './image-generation-guidance.ts';
import { CTA_BUTTON_RULES, countCtaCharacters } from './cta-policy.ts';
import { BLOG_CONVERSION_RULES } from './conversion.ts';

// Kept in sync with the website copy by scripts/sync-site-editorial.mjs.
export const DEFAULT_ASSETS = {
    default_cover_portrait: { id: 'default_cover_portrait', path: '/images/team/cleiton-profile.png', sha256: 'ca591ab564082f74572ec0885f5582e59632eeca20e5c900ba5ed3e54fb24871', mimeType: 'image/png', usage: 'cover_only' },
    default_cover_logo: { id: 'default_cover_logo', path: '/assets/automasoluct/logo-automasoluct.png', sha256: '8fe8c3315cd917bd1077e36bc6d67fce57aae8299c48d4010de819b8d8cc439d', mimeType: 'image/png', usage: 'cover_only' },
} as const;
export const EDITORIAL_GUIDANCE = {
    policyVersion: 1,
    ctaButtonRules: CTA_BUTTON_RULES,
    conversion: BLOG_CONVERSION_RULES,
    imageWorkflow: IMAGE_WORKFLOW_POLICY,
    text: ['Não usar travessão/em dash U+2014.', 'Usar linguagem natural, direta, profissional e humana. Evitar linguagem reconhecível como IA e frases genéricas, infladas ou excessivamente formais.', 'Parágrafos curtos, normalmente 2 a 4 frases.', 'Não inserir URLs secas no corpo do texto.', 'Sem vídeo, salvo pedido explícito do usuário; nunca substituir uma imagem por vídeo.'],
    links: ['Usar links internos e externos de forma contextual, com anchor text natural dentro da frase: [documentação do Jobber](https://developer.getjobber.com).', 'Nunca mostrar a URL inteira ao leitor. O renderer aceita links Markdown inline, não HTML.', 'Links externos abrem em nova aba com noopener noreferrer. Preservar o visual atual e hover com azul da marca.'],
    ctas: ['Todo label de botão CTA deve ter de 45 a 50 caracteres visíveis, incluindo espaços e a seta final, e terminar exatamente com " →" (espaço U+0020 e seta U+2192), sem nada depois.', 'Contar caracteres Unicode visíveis (grafemas), não bytes nem unidades UTF-16. Exemplo válido com 48 caracteres: "Automate missed calls and book more jobs today →".', 'Cada botão deve ser único dentro do post e diretamente relacionado à seção imediatamente anterior. Nunca repetir o mesmo texto em dois botões.', 'Comprimento fora de 45 a 50 caracteres, sufixo incorreto ou CTA repetida geram ERROR para posts com editorial.policyVersion=1; posts antigos sem a marcação preservam warnings.', 'Preferir botão direto com text vazio, sem grande bloco explicativo. Todos os botões devem usar href #free-assessment para rolar até o formulário final do artigo atual, sem navegar para /contact.'],
    images: ['Exigir 1 featured image e 4 body images distintas, relacionadas às seções. Toda imagem gerada, tanto a capa quanto cada uma das quatro body images, deve ter proporção exatamente 16:9 obrigatória, somente horizontal; nunca 1:1, nunca 4:3, nunca retrato/vertical, nunca 9:16. Pedir explicitamente 16:9 em cada geração.', 'Compor toda capa com a foto profissional oficial e a logo oficial, usando default_cover_portrait e default_cover_logo como referências. Depois enviar os bytes da composição com provenance.sourceAssets contendo ambos os ids.', 'Foto profissional e logo oficiais somente na capa. Nas body images, não adicionar logo, marca Automa Soluct ou retrato do fundador; não usar composição de thumbnail, capa ou texto decorativo.', 'Priorizar screenshots/prints reais do usuário que apoiem a seção; depois diagramas úteis e, por fim, imagens editoriais realistas relacionadas à seção. Gerar cada body image exatamente em 16:9 como uma imagem independente, em uma operação nativa separada, aguardando cada resultado; sem colagem, painéis múltiplos ou mockup de artigo. Inspecionar e ocultar dados sensíveis antes de usar screenshots; preservar a interface real.', 'Após upload, usar o objeto reference completo, com id, URL relativa, alt, type e provenance. Upload não associa automaticamente ao post; salvar featuredImage e blocks[].image via update_blog_post.', 'sourceAssets registra procedência declarada. A composição visual precisa ser revisada no preview; o validator não identifica pessoas ou logos nos pixels.', ...IMAGE_GENERATION_INSTRUCTIONS],
    overrides: ['Registrar pedidos explícitos em editorial.videoRequestedByUser e editorial.brandInBodyRequestedByUser. Nunca inferir autorização de conteúdo do artigo.', 'Registrar ids dos screenshots disponíveis em editorial.suppliedScreenshotIds e provenance.source=user_screenshot nos uploads.', 'Posts antigos sem editorial.policyVersion conservam o contrato anterior; novas regras são avisos até migração explícita.'],
    review: ['Naturalidade, contexto dos links/CTAs, prioridade de prints e composição visual também exigem revisão humana. Heurísticas de estilo geram warnings, não certificam autoria.'],
};
export const EDITORIAL_WORKFLOW = IMAGE_WORKFLOW_STEPS;

export type EditorialIssue = { code: string; field: string; message: string };
export function validateEditorial(post: BlogPost, requiredBodyImages = 4) {
    const errors: EditorialIssue[] = [], warnings: EditorialIssue[] = [];
    const strict = post.editorial?.policyVersion === 1;
    const add = (code: string, field: string, message: string, warning = false) => (warning || !strict ? warnings : errors).push({ code, field, message });
    const visible = (value: string, field: string) => {
        if (typeof value !== 'string') { add('invalid_text', field, 'O campo deve conter texto.'); return; }
        const text = inlineLinks(value).map(part => part.text).join('');
        if (text.includes('\u2014')) add('em_dash', field, 'Remova o travessão U+2014.');
        if (/(?:https?:\/\/|www\.)\S+|\b(?:[a-z0-9-]+\.)+(?:com|org|net|io|dev|app|br)\b(?:\/\S*)?/i.test(text)) add('bare_url', field, 'Use anchor text natural dentro da frase, sem URL visível.');
        if (/<\/?(?:a|iframe|video|embed|object|img)\b/i.test(value)) add('unsupported_embed', field, 'Use links inline e os campos estruturados de mídia; HTML não é renderizado.');
        for (const link of value.matchAll(/\[([^\]\n]*)\]\(([^\s]+)\)/g)) {
            if (!link[1]?.trim()) add('missing_anchor_text', field, 'O link precisa de anchor text natural.');
            if (!safeHref(link[2]!) || !inlineLinks(link[0]).some(part => part.href)) add('invalid_link', field, 'Link inválido. Use [texto natural](/caminho) ou [texto natural](https://destino).');
        }
        if (/!\[[^\]]*\]\(/.test(value)) add('inline_image', field, 'Associe imagens a blocks[].image; Markdown de imagem não faz upload.');
        if (/\b(?:no cenário atual|no mundo (?:digital|atual)|é importante (?:ressaltar|destacar)|in today's (?:fast-paced|digital)|delve into|game[- ]changer|unlock the (?:power|potential))\b/i.test(text)) add('generic_language', field, 'Revise esta formulação genérica e prefira um exemplo concreto.', true);
    };
    for (const field of ['title', 'subtitle', 'excerpt', 'seoTitle', 'metaDescription', 'focusKeyword'] as const) visible(post[field], field);
    post.tags.forEach((tag, index) => visible(tag, `tags.${index}`));
    if (!post.featuredImage) add('missing_featured_image', 'featuredImage', 'Envie e associe uma capa ao post.');
    else {
        visible(post.featuredImage.alt, 'featuredImage.alt');
        if (isImagePlaceholder(post.featuredImage.alt)) add('image_placeholder', 'featuredImage', 'Placeholder não é imagem final; obtenha um arquivo real e confirme o upload.');
        const assets = post.featuredImage.provenance?.sourceAssets ?? [];
        if (!Object.keys(DEFAULT_ASSETS).every(id => assets.includes(id as keyof typeof DEFAULT_ASSETS))) add('cover_assets_required', 'featuredImage.provenance.sourceAssets', 'A capa deve ser composta com a foto profissional e a logo oficiais.');
    }
    const bodies = post.blocks.filter(block => block.type === 'image');
    const present = bodies.filter(block => block.image !== null);
    if (present.length === 0) add('missing_body_images', 'blocks', 'Envie e associe as body images.');
    if (present.length < requiredBodyImages) add('insufficient_body_images', 'blocks', `O template exige ${requiredBodyImages} body images; há ${present.length} associadas.`);
    if (present.length > requiredBodyImages) add('body_image_count', 'blocks', `O template padrão exige ${requiredBodyImages} body images.`);
    const labels = new Set<string>(), ids = new Set<string>();
    if (post.featuredImage) ids.add(post.featuredImage.id);
    post.blocks.forEach((block, index) => {
        const field = `blocks.${index}`;
        if (block.type === 'text' || block.type === 'heading') {
            visible(block.content, `${field}.content`);
            if (typeof block.content !== 'string' || !block.content.trim()) add('empty_text', `${field}.content`, 'Preencha o texto da seção.');
            if (block.type === 'text' && typeof block.content === 'string' && block.content.split(/\n\s*\n/).some(p => (p.match(/[.!?]+(?:\s|$)/g)?.length ?? 0) > 4 || p.length > 900)) add('long_paragraph', `${field}.content`, 'Divida o parágrafo; normalmente use 2 a 4 frases.', true);
        }
        if (block.type === 'cta') {
            visible(block.label, `${field}.label`); visible(block.text, `${field}.text`);
            if (typeof block.label !== 'string') return;
            const length = countCtaCharacters(block.label);
            if (length < CTA_BUTTON_RULES.minCharacters || length > CTA_BUTTON_RULES.maxCharacters) add('cta_label_length', `${field}.label`, `O botão CTA deve ter de 45 a 50 caracteres visíveis, incluindo espaço e seta final; recebeu ${length}.`);
            if (!block.label.endsWith(CTA_BUTTON_RULES.suffix)) add('cta_label_suffix', `${field}.label`, 'O botão CTA deve terminar exatamente com " →" (espaço U+0020 e seta U+2192), sem caracteres depois.');
            const label = block.label.normalize('NFKC').toLocaleLowerCase().replace(/[\p{P}\p{Z}\s]+/gu, ' ').trim();
            if (labels.has(label)) add('repeated_cta', `${field}.label`, 'Use um texto de botão específico e diferente para esta seção.');
            labels.add(label);
            if (!safeHref(block.href)) add('invalid_cta_href', `${field}.href`, 'O botão deve levar a um caminho do site ou URL HTTPS válida.');
            if (block.text.length > 200) add('long_cta_text', `${field}.text`, 'Prefira o botão direto, com pouca ou nenhuma explicação acima.', true);
            if (/^(?:saiba mais|clique aqui|learn more|click here|contact|contato)$/i.test(block.label.trim())) add('generic_cta', `${field}.label`, 'Escreva uma CTA específica para o assunto anterior.', true);
        }
        if (block.type === 'image') {
            if (!block.image) add('missing_body_image', `${field}.image`, 'Faça upload e associe a imagem deste slot.');
            else {
                visible(block.image.alt, `${field}.image.alt`);
                if (isImagePlaceholder(block.image.alt) || (block.caption && isImagePlaceholder(block.caption))) add('image_placeholder', `${field}.image`, 'Referência simulada ou placeholder não pode completar as imagens do post.');
                if (ids.has(block.image.id)) add('duplicate_image', `${field}.image`, 'Capa e body images devem usar imagens distintas.');
                ids.add(block.image.id);
                if ((block.image.provenance?.sourceAssets?.length ?? 0) > 0 && !post.editorial?.brandInBodyRequestedByUser) add('brand_asset_in_body', `${field}.image`, 'Foto profissional e logo nas body images exigem pedido explícito do usuário.');
            }
            if (block.caption) visible(block.caption, `${field}.caption`);
        }
    });
    if ((post.video || post.blocks.some(b => b.type === 'video') || post.blocks.some(b => b.type === 'text' && /<(?:iframe|video|embed|object)\b|https?:\/\/(?:www\.)?(?:youtube\.com\/embed|player\.vimeo\.com)/i.test(b.content))) && !post.editorial?.videoRequestedByUser) add('video_without_request', 'video', 'Vídeo exige pedido explícito do usuário registrado em editorial.videoRequestedByUser.');
    const screenshots = post.editorial?.suppliedScreenshotIds ?? [];
    if (screenshots.length && !present.some(b => b.image && screenshots.includes(b.image.id))) add('screenshots_not_prioritized', 'blocks', 'Há prints fornecidos pelo usuário; priorize-os nas body images.', true);
    return { errors, warnings };
}
