package com.myvlog.blog.utils;

import com.myvlog.blog.dto.ArticleResponse;
import org.commonmark.Extension;
import org.commonmark.ext.gfm.tables.TablesExtension;
import org.commonmark.node.AbstractVisitor;
import org.commonmark.node.Heading;
import org.commonmark.node.Node;
import org.commonmark.node.Text;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.AttributeProvider;
import org.commonmark.renderer.html.AttributeProviderContext;
import org.commonmark.renderer.html.AttributeProviderFactory;
import org.commonmark.renderer.html.HtmlRenderer;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Component
public class MarkdownUtils {

    /**
     * Convert Markdown to HTML
     *
     * @param markdown markdown content
     * @return html content
     */
    public static String renderHtml(String markdown) {
        if (!StringUtils.hasText(markdown)) {
            return "";
        }

        Node document = parse(markdown);
        HtmlRenderer renderer = HtmlRenderer.builder()
                .extensions(Arrays.asList(TablesExtension.create()))
                .attributeProviderFactory(context -> new TOCAttributeProvider())
                .build();

        return renderer.render(document);
    }

    /**
     * Extract TOC from Markdown
     */
    public static List<ArticleResponse.TocItem> extractToc(String markdown) {
        if (!StringUtils.hasText(markdown)) {
            return new ArrayList<>();
        }

        Node document = parse(markdown);
        List<ArticleResponse.TocItem> toc = new ArrayList<>();
        
        document.accept(new AbstractVisitor() {
            private int counter = 0;
            @Override
            public void visit(Heading heading) {
                String text = extractHeadingText(heading);
                // IMPORTANT: ID generation MUST match TOCAttributeProvider exactly
                String id = "toc-" + (counter++);

                ArticleResponse.TocItem item = new ArticleResponse.TocItem();
                item.setText(text);
                item.setId(id);
                item.setLevel(heading.getLevel());
                
                toc.add(item);
                super.visit(heading);
            }
        });

        return toc;
    }

    private static Node parse(String markdown) {
        Parser parser = Parser.builder()
                .extensions(Arrays.asList(TablesExtension.create()))
                .build();
        return parser.parse(markdown);
    }

    private static String extractHeadingText(Heading heading) {
        StringBuilder textBuilder = new StringBuilder();
        heading.accept(new AbstractVisitor() {
            @Override
            public void visit(Text text) {
                textBuilder.append(text.getLiteral());
            }
        });
        String text = textBuilder.toString();
        return StringUtils.hasText(text) ? text : "Heading";
    }

    private static class TOCAttributeProvider implements AttributeProvider {
        private int headingCount = 0;

        @Override
        public void setAttributes(Node node, String tagName, Map<String, String> attributes) {
            if (node instanceof Heading) {
                // IMPORTANT: ID generation MUST match extractToc exactly
                attributes.put("id", "toc-" + (headingCount++));
            }
        }
    }
}
