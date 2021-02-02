import React from "react";
import { CodeSnippet, Tile } from "carbon-components-react";
import style from "./view.module.css";

export interface Metric {
  bytes_transferred: number;
  req_count: number;
}

export interface Props {
  apiKey: string;
  log: string;
  metrics: {
    min: Metric;
    hour: Metric;
    day: Metric;
  };
}

export default class ViewComponent extends React.Component<Props> {
  render() {
    return (
      <div className={style.container}>
        <div className={style.logContainer}>
          <h1>API Key</h1>
          <CodeSnippet type="single" feedback="Copied to clipboard">
            {this.props.apiKey}
          </CodeSnippet>
          <h1>Daily Log</h1>
          <CodeSnippet type="multi">{this.props.log}</CodeSnippet>
        </div>
        <div className={style.metricsContainer}>
          <h1>Metrics</h1>
          <h3>Minute:</h3>
          <div className={style.metric}>
            <span>
              Bytes: <b>{this.props.metrics.min.bytes_transferred}</b>
            </span>
            <span>
              Req Count: <b>{this.props.metrics.min.req_count}</b>
            </span>
          </div>
          <h3>Hour:</h3>
          <div className={style.metric}>
            <span>
              Bytes: <b>{this.props.metrics.hour.bytes_transferred}</b>
            </span>
            <span>
              Req Count: <b>{this.props.metrics.hour.req_count}</b>
            </span>
          </div>
          <h3>Day:</h3>
          <div className={style.metric}>
            <span>
              Bytes: <b>{this.props.metrics.day.bytes_transferred}</b>
            </span>
            <span>
              Req Count: <b>{this.props.metrics.day.req_count}</b>
            </span>
          </div>
        </div>
      </div>
    );
  }
}
