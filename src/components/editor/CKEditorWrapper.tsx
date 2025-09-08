"use client";

import React, { FC, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Alignment,
  Autoformat,
  Bold,
  Italic,
  Underline,
  BlockQuote,
  Base64UploadAdapter,
  CloudServices,
  Essentials,
  Heading,
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  PictureEditing,
  Indent,
  IndentBlock,
  Link,
  List,
  Font,
  Mention,
  Paragraph,
  PasteFromOffice,
  Table,
  TableColumnResize,
  TableToolbar,
  TableProperties,
  TableCellProperties,
  TextTransformation,
  SourceEditing,
} from "ckeditor5";

interface CkEditorProps {
  editorData: string;
  setEditorData: (html: string) => void;
}

const CKEditorWrapper: FC<CkEditorProps> = ({ setEditorData, editorData }) => {
  useEffect(() => {
    console.log("what is editorData: ", editorData);
  }, [editorData]);

  return (
    <CKEditor
      editor={ClassicEditor}
      data={editorData}
      config={{
        licenseKey: "GPL",
        plugins: [
          Alignment,
          Autoformat,
          BlockQuote,
          Bold,
          CloudServices,
          Essentials,
          Heading,
          Image,
          ImageCaption,
          ImageResize,
          ImageStyle,
          ImageToolbar,
          ImageUpload,
          Base64UploadAdapter,
          Indent,
          IndentBlock,
          Italic,
          Link,
          Font,
          List,
          Mention,
          Paragraph,
          PasteFromOffice,
          PictureEditing,
          Table,
          TableColumnResize,
          TableProperties,
          TableCellProperties,
          TableToolbar,
          TextTransformation,
          Underline,
          SourceEditing,
        ],
        toolbar: [
          "undo",
          "redo",
          "|",
          "heading",
          "|",
          "bold",
          "italic",
          "underline",
          "|",
          "link",
          "uploadImage",
          "insertTable",
          "blockQuote",
          "|",
          "fontSize",
          "fontColor",
          "fontBackgroundColor",
          "|",
          "bulletedList",
          "numberedList",
          "|",
          "alignment",
          "|",
          "outdent",
          "indent",
          "sourceEditing",
        ],
        list: {
          properties: {
            styles: true,
            startIndex: true,
            reversed: true,
          },
        },
        extraPlugins: [
          function (editor: any) {
            // Custom heading styles
            editor.conversion.for("dataDowncast").elementToElement({
              model: "heading1",
              view: (modelElement: any, { writer }: any) => {
                return writer.createContainerElement("h1", {
                  style:
                    "font-size: 2rem; font-weight: bold; margin: 1rem 0; color: #1f2937;",
                });
              },
            });

            editor.conversion.for("dataDowncast").elementToElement({
              model: "heading2",
              view: (modelElement: any, { writer }: any) => {
                return writer.createContainerElement("h2", {
                  style:
                    "font-size: 1.5rem; font-weight: bold; margin: 0.8rem 0; color: #1f2937;",
                });
              },
            });

            editor.conversion.for("dataDowncast").elementToElement({
              model: "heading3",
              view: (modelElement: any, { writer }: any) => {
                return writer.createContainerElement("h3", {
                  style:
                    "font-size: 1.25rem; font-weight: bold; margin: 0.6rem 0; color: #1f2937;",
                });
              },
            });
            editor.conversion.for("dataDowncast").elementToElement({
              model: "heading4",
              view: (modelElement: any, { writer }: any) => {
                return writer.createContainerElement("h4", {
                  style:
                    "font-size: 1.125rem; font-weight: bold; margin: 0.5rem 0; color: #1f2937;",
                });
              },
            });
            editor.conversion.for("dataDowncast").elementToElement({
              model: "heading5",
              view: (modelElement: any, { writer }: any) => {
                return writer.createContainerElement("h5", {
                  style:
                    "font-size: 1rem; font-weight: bold; margin: 0.4rem 0; color: #1f2937;",
                });
              },
            });
            editor.conversion.for("dataDowncast").elementToElement({
              model: "heading6",
              view: (modelElement: any, { writer }: any) => {
                return writer.createContainerElement("h6", {
                  style:
                    "font-size: 0.875rem; font-weight: bold; margin: 0.3rem 0; color: #1f2937;",
                });
              },
            });
            editor.conversion.for("dataDowncast").elementToElement({
              model: "caption",
              view: (modelElement: any, { writer }: any) => {
                return writer.createContainerElement("figcaption", {
                  style:
                    "text-align: center;margin-top: 0.5rem;font-style: italic;font-size: 0.875rem",
                });
              },
            });
          },
        ],
        heading: {
          options: [
            {
              model: "paragraph",
              title: "Paragraph",
              class: "ck-heading_paragraph",
            },
            {
              model: "heading1",
              view: "h1",
              title: "Heading 1",
              class: "ck-heading_heading1",
            },
            {
              model: "heading2",
              view: "h2",
              title: "Heading 2",
              class: "ck-heading_heading2",
            },
            {
              model: "heading3",
              view: "h3",
              title: "Heading 3",
              class: "ck-heading_heading3",
            },
            {
              model: "heading4",
              view: "h4",
              title: "Heading 4",
              class: "ck-heading_heading4",
            },
            {
              model: "heading5",
              view: "h5",
              title: "Heading 5",
              class: "ck-heading_heading5",
            },
            {
              model: "heading6",
              view: "h6",
              title: "Heading 6",
              class: "ck-heading_heading6",
            },
          ],
        },
        image: {
          resizeOptions: [
            {
              name: "resizeImage:original",
              label: "Default image width",
              value: null,
            },
            {
              name: "resizeImage:25",
              label: "25% page width",
              value: "25",
            },
            {
              name: "resizeImage:33",
              label: "33% page width",
              value: "33",
            },
            {
              name: "resizeImage:40",
              label: "40% page width",
              value: "40",
            },
            {
              name: "resizeImage:50",
              label: "50% page width",
              value: "50",
            },
            {
              name: "resizeImage:75",
              label: "75% page width",
              value: "75",
            },
          ],
          toolbar: [
            "imageTextAlternative",
            "toggleImageCaption",
            "|",
            "imageStyle:inline",
            "imageStyle:wrapText",
            "imageStyle:breakText",
            "|",
            "resizeImage",
          ],
        },
        fontColor: {
          colors: [
            {
              color: "hsl(0, 0%, 0%)",
              label: "Black",
            },
            {
              color: "hsl(0, 0%, 30%)",
              label: "Dim grey",
            },
            {
              color: "hsl(0, 0%, 60%)",
              label: "Grey",
            },
            {
              color: "hsl(0, 0%, 90%)",
              label: "Light grey",
            },
            {
              color: "hsl(0, 0%, 100%)",
              label: "White",
              hasBorder: true,
            },
            {
              color: "hsl(0, 75%, 60%)",
              label: "Red",
            },
            {
              color: "hsl(30, 75%, 60%)",
              label: "Orange",
            },
            {
              color: "hsl(60, 75%, 60%)",
              label: "Yellow",
            },
            {
              color: "hsl(90, 75%, 60%)",
              label: "Light green",
            },
            {
              color: "hsl(120, 75%, 60%)",
              label: "Green",
            },
          ],
        },
        fontSize: {
          options: [
            10,
            12,
            "default",
            16,
            18,
            20,
            22,
            24,
            26,
            28,
            30,
            32,
            34,
            36,
          ],
          supportAllValues: true,
        },
        fontBackgroundColor: {
          colors: [
            {
              color: "hsl(0, 75%, 60%)",
              label: "Red",
            },
            {
              color: "hsl(30, 75%, 60%)",
              label: "Orange",
            },
            {
              color: "hsl(60, 75%, 60%)",
              label: "Yellow",
            },
            {
              color: "hsl(90, 75%, 60%)",
              label: "Light green",
            },
            {
              color: "hsl(120, 75%, 60%)",
              label: "Green",
            },
            {
              color: "hsl(0, 0%, 0%)",
              label: "Black",
            },
            {
              color: "hsl(0, 0%, 30%)",
              label: "Dim grey",
            },
            {
              color: "hsl(0, 0%, 60%)",
              label: "Grey",
            },
            {
              color: "hsl(0, 0%, 90%)",
              label: "Light grey",
            },
          ],
        },
        link: {
          addTargetToExternalLinks: true,
          defaultProtocol: "https://",
        },
        table: {
          contentToolbar: [
            "tableColumn",
            "tableRow",
            "mergeTableCells",
            "tableCellProperties",
            "tableProperties",
            "|",
            "alignment:left",
            "alignment:center",
            "alignment:right",
            "alignment:justify",
          ],
          tableToolbar: ["bold", "italic", "|", "alignment"],
          tableCellProperties: {
            borderColors: [
              {
                color: "hsl(0, 0%, 0%)",
                label: "Black",
              },
              {
                color: "hsl(0, 0%, 30%)",
                label: "Dim grey",
              },
              {
                color: "hsl(0, 0%, 60%)",
                label: "Grey",
              },
              {
                color: "hsl(0, 0%, 90%)",
                label: "Light grey",
              },
              {
                color: "hsl(0, 0%, 100%)",
                label: "White",
              },
            ],
            backgroundColors: [
              {
                color: "hsl(0, 0%, 0%)",
                label: "Black",
              },
              {
                color: "hsl(0, 0%, 30%)",
                label: "Dim grey",
              },
              {
                color: "hsl(0, 0%, 60%)",
                label: "Grey",
              },
              {
                color: "hsl(0, 0%, 90%)",
                label: "Light grey",
              },
              {
                color: "hsl(0, 0%, 100%)",
                label: "White",
              },
              {
                color: "hsl(0, 75%, 60%)",
                label: "Red",
              },
              {
                color: "hsl(30, 75%, 60%)",
                label: "Orange",
              },
              {
                color: "hsl(60, 75%, 60%)",
                label: "Yellow",
              },
              {
                color: "hsl(90, 75%, 60%)",
                label: "Light green",
              },
              {
                color: "hsl(120, 75%, 60%)",
                label: "Green",
              },
            ],
          },
          tableProperties: {
            borderColors: [
              {
                color: "hsl(0, 0%, 0%)",
                label: "Black",
              },
              {
                color: "hsl(0, 0%, 30%)",
                label: "Dim grey",
              },
              {
                color: "hsl(0, 0%, 60%)",
                label: "Grey",
              },
              {
                color: "hsl(0, 0%, 90%)",
                label: "Light grey",
              },
              {
                color: "hsl(0, 0%, 100%)",
                label: "White",
              },
            ],
            backgroundColors: [
              {
                color: "hsl(0, 0%, 0%)",
                label: "Black",
              },
              {
                color: "hsl(0, 0%, 30%)",
                label: "Dim grey",
              },
              {
                color: "hsl(0, 0%, 60%)",
                label: "Grey",
              },
              {
                color: "hsl(0, 0%, 90%)",
                label: "Light grey",
              },
              {
                color: "hsl(0, 0%, 100%)",
                label: "White",
              },
            ],
          },
        },
        placeholder: "Type or paste your content here!",
      }}
      onChange={(_event, editor) => {
        const data = editor.getData();
        setEditorData(data);
      }}
      onFocus={() => console.log("Editor focused")}
      onBlur={() => console.log("Editor blurred")}
    />
  );
};

export default CKEditorWrapper;
