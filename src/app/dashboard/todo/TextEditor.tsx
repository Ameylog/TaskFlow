"use client"
import { Editor } from '@tinymce/tinymce-react';
import type { Editor as TinyMCEEditor } from 'tinymce';
import "@/styles/texteditor.css";
import { useEffect, useRef } from 'react';

function TextEditor({ id, value, onChange, }: {
    id: string
    value: string
    onChange: (value: string) => void
}) {
    const editorRef = useRef<TinyMCEEditor | null>(null);

    // Automatically convert Markdown whenever the AI updates the 'value'
    useEffect(() => {
        const editor = editorRef.current;
        // Logic: If value contains Markdown markers and isn't already HTML
        if (editor && value && (value.includes('**') || value.includes('#')) && !value.includes('<')) {
            editor.setContent(''); // Clear current content
            editor.execCommand('MarkdownInsert', false, value);
        }
    }, [value]);

    return (
        <>
            <Editor
                apiKey='woh9pohxuiiwb94s4sdtj9m5qtkzbzug9am5jtsjce9sk22w'
                onInit={(_evt, editor) => editorRef.current = editor}
                id={id}
                value={value}
                onEditorChange={onChange}
                init={{
                    // plugins: [
                    //     'anchor', 'charmap', 'codesample', 'emoticons', 'link', 'lists', 'media', 'searchreplace', 'visualblocks', 'wordcount', 'markdown',
                    //     'checklist', 'mediaembed', 'casechange', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'advtemplate', 'tinymceai', 'uploadcare', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown', 'importword', 'exportword', 'exportpdf'
                    // ],
                    plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview' // Only keep open-source plugins
                    ],
                    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography uploadcare | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                    tinycomments_mode: 'embedded',
                    tinycomments_author: 'Author name',
                    tinymceai_token_provider: async () => {
                        await fetch(`https://demo.api.tiny.cloud/1/woh9pohxuiiwb94s4sdtj9m5qtkzbzug9am5jtsjce9sk22w/auth/random`, { method: "POST", credentials: "include" });
                        return { token: await fetch(`https://demo.api.tiny.cloud/1/woh9pohxuiiwb94s4sdtj9m5qtkzbzug9am5jtsjce9sk22w/jwt/tinymceai`, { credentials: "include" }).then(r => r.text()) };
                    },
                    uploadcare_public_key: '5d278f2963426f9d725d',
                    height: 200,
                    branding: false,
                    toolbar_location: 'top',
                    menubar: false,
                    promotion: false,  // Optional: removes the "Upgrade" or "Trial" button
                    // Key fixes:
                    ui_mode: 'split',
                    toolbar_sticky: false,
                    statusbar: false,
                    content_style: 'body { font-family: inherit; font-size: 14px; }',

                    // Prevent TinyMCE from stealing/losing focus on select dropdowns
                    setup: (editor) => {
                        editor.on('init', () => {
                            editor.getContainer().style.pointerEvents = 'all';
                        });
                    },

                }}

            />
        </>
    )
}

export default TextEditor
