package com.myvlog.blog.utils;

import com.myvlog.blog.dto.ArticleResponse;
import org.commonmark.Extension;
import org.commonmark.ext.gfm.tables.TablesExtension;
import org.commonmark.ext.heading.anchor.HeadingAnchorExtension;
import org.commonmark.node.AbstractVisitor;
import org.commonmark.node.Heading;
import org.commonmark.node.Node;
import org.commonmark.node.Text;
import org.commonmark.parser.Parser;
import org.commonmark.renderer.html.HtmlRenderer;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

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

        List<Extension> extensions = Arrays.asList(
                TablesExtension.create(),
                HeadingAnchorExtension.create()
        );

        Parser parser = Parser.builder()
                .extensions(extensions)
                .build();

        Node document = parser.parse(markdown);

        HtmlRenderer renderer = HtmlRenderer.builder()
                .extensions(extensions)
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

        List<Extension> extensions = Arrays.asList(
                TablesExtension.create(),
                HeadingAnchorExtension.create()
        );
        Parser parser = Parser.builder().extensions(extensions).build();
        Node document = parser.parse(markdown);

        List<ArticleResponse.TocItem> toc = new ArrayList<>();
        
        document.accept(new AbstractVisitor() {
            @Override
            public void visit(Heading heading) {
                String text = "";
                if (heading.getFirstChild() instanceof Text) {
                    text = ((Text) heading.getFirstChild()).getLiteral();
                } else {
                    // Simple fallback for complex headers
                    text = heading.toString(); 
                }
                
                // Id generation logic should match HeadingAnchorExtension
                // Simplified: replace spaces with dashes, lowercase
                String id = text.toLowerCase().replaceAll("[^a-z0-9\\-_]", "-");

                ArticleResponse.TocItem item = new ArticleResponse.TocItem();
                item.setText(text);
                item.setId(id);
                item.setLevel(heading.getLevel());
                
                // Flattened list for simplicity, frontend can build tree
                toc.add(item);
                
                super.visit(heading);
            }
        });

        return toc;
    }
}
