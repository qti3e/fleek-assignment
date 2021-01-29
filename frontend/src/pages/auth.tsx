import React from "react";
import style from "./auth.module.css";
import {
  Button,
  ContentSwitcher,
  ContentSwitcherOnChangeData,
  FluidForm,
  Switch,
  TextInput,
} from "carbon-components-react";

interface AuthPageState {
  currentView: 0 | 1;
  formData: Record<string, string>
}

export class AuthPage extends React.Component<{}, AuthPageState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      currentView: 0,
      formData: {},
    };

    // Bind event handlers to the current instance of the component.
    this.handleContentSwitcherChange = this.handleContentSwitcherChange.bind(
      this
    );
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleContentSwitcherChange(data: ContentSwitcherOnChangeData) {
    this.setState({
      currentView: data.index as 0 | 1,
    });
  }

  handleInputChange(key: string, event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.currentTarget.value;
    this.setState((s) => ({
      formData: {
        ...s.formData,
        [key]: value,
      },
    }));
  }

  render() {
    const isSignIn = !this.state.currentView;

    return (
      <div className={style.outer}>
        <div className={style.container}>
          <ContentSwitcher
            onChange={this.handleContentSwitcherChange}
            selectedIndex={this.state.currentView}
          >
            <Switch name="sign-in" text="Sign In"></Switch>
            <Switch name="sign-up" text="Sign Up"></Switch>
          </ContentSwitcher>

          <FluidForm className={style.formContainer}>
            <TextInput
              id="username"
              labelText="Username"
              required
              value={this.state.formData.username}
              onChange={(e) => this.handleInputChange("username", e)}
            ></TextInput>
            <TextInput
              id="password"
              type="password"
              labelText="Password"
              required
              value={this.state.formData.password}
              onChange={(e) => this.handleInputChange("password", e)}
            ></TextInput>
            {!isSignIn && (
              <TextInput
                id="r-password"
                type="password"
                labelText="Repeat Password"
                required
                value={this.state.formData["repeat-password"]}
                onChange={(e) => this.handleInputChange("repeat-password", e)}
              ></TextInput>
            )}
          </FluidForm>

          <Button>{isSignIn ? "Login" : "Create new account"}</Button>
        </div>
      </div>
    );
  }
}
