import Moment from "react-moment";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import Seo from "../../components/seo";

import { fetchAPI } from "../../services/api";
import { getStrapiMedia } from "../../services/media";

import { GetStaticPaths, GetStaticProps } from "next";

export default function Article({ article }) {
  const imageUrl = getStrapiMedia(article.attributes.image);

  const seo = {
    metaTitle: article.attributes.title,
    metaDescription: article.attributes.description,
    shareImage: article.attributes.image,
    article: true,
  };

  return (
    <><Seo seo={seo} /><div
      id="banner"
      className="uk-height-medium uk-flex uk-flex-center uk-flex-middle uk-background-cover uk-light uk-padding uk-margin"
      data-src={imageUrl}
      data-srcset={imageUrl}
      data-uk-img
    >
      <h1>{article.attributes.title}</h1>
    </div><div className="uk-section">
        <div className="uk-container uk-container-small">
          <ReactMarkdown children={article.attributes.content} rehypePlugins={[rehypeRaw]} />
          <hr className="uk-divider-small" />
          <div className="uk-grid-small uk-flex-left" data-uk-grid="true">
            <div className="uk-width-expand">
              <p className="uk-margin-remove-bottom">
                By {article.attributes.author.data.attributes.name}
              </p>
              <p className="uk-text-meta uk-margin-remove-top">
                <Moment format="MMM Do YYYY">
                  {article.attributes.published_at}
                </Moment>
              </p>
            </div>
          </div>
        </div>
      </div></>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const articlesRes = await fetchAPI("/articles", { fields: ["slug"] });

  return {
    paths: articlesRes.data.map((article) => ({
      params: {
        slug: article.attributes.slug,
      },
    })),
    fallback: false,
  };
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const articlesRes = await fetchAPI("/articles", {
    filters: {
      slug: params.slug,
    },
    populate: ["image", "category", "author.picture"],
  });
  const categoriesRes = await fetchAPI("/categories");

  return {
    props: { article: articlesRes.data[0], categories: categoriesRes },
    revalidate: 1,
  };
}
