import React from "react";
import { Report } from "./report";
import NoReportsFound from "./noReportsFound";
import { Typography, CircularProgress } from "@material-ui/core";

const ArticlesShowcase = (props) => {
  const { articles, articlesLoading, province } = props;
  console.log(articles);

  return (
    <div style={{ marginTop: "4em" }}>
      <Typography component="h2" variant="h5">Outbreak information near {province}</Typography>
      <div style={{ height: "50vh", overflow: "scroll"}}>
        {articlesLoading
          ? <CircularProgress style={{margin: "1em"}}/>
          : articles.length !== 0 ? articles?.slice(0,10).map((article, index) => <Report key={index} article={article} />) : <NoReportsFound />
        }
      </div>
    </div>
  );
}

export default ArticlesShowcase;