import React from "react";
import style from "./auth.module.css";
import {
  Button,
  ContentSwitcher,
  ContentSwitcherOnChangeData,
  FluidForm,
  InlineLoading,
  Switch,
  TextInput,
} from "carbon-components-react";

export interface Props {
  // Is a request in progress?
  isLoading: boolean;
  // Handle sign-up submit.
  onSignUp(username: string, password: string): void;
  // Handle sign-in submit.
  onSignIn(username: string, password: string): void;
}

enum ViewIndex {
  SignIn = 0,
  SignUp = 1,
}

interface State {
  view: ViewIndex;
  form: AuthForm;
  isTouched: Record<keyof AuthForm, boolean>;
}

interface AuthForm {
  username: string;
  password: string;
  r_password: string;
}

export default class AuthComponent extends React.Component<Props, State> {
  state = {
    view: ViewIndex.SignIn,
    form: {
      username: "",
      password: "",
      r_password: "",
    },
    isTouched: {
      username: false,
      password: false,
      r_password: false,
    },
  };

  constructor(props: Props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleContentSwitcherChange = this.handleContentSwitcherChange.bind(this);
  }

  handleContentSwitcherChange(data: ContentSwitcherOnChangeData) {
    this.setState({
      view: data.index as ViewIndex,
    });
  }

  handleInputChange(key: keyof AuthForm, event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.currentTarget.value;
    this.setState((s) => ({
      form: {
        ...s.form,
        [key]: value,
      },
      isTouched: {
        ...s.isTouched,
        [key]: true,
      },
    }));
  }

  handleSubmit() {
    const { view, form } = this.state;
    if (view === ViewIndex.SignIn) {
      this.props.onSignIn(form.username, form.password);
    } else {
      this.props.onSignUp(form.username, form.password);
    }
  }

  validateForm() {
    const {
      view,
      form: { username, password, r_password },
      isTouched,
    } = this.state;
    const usernameRegexp = /^[0-9a-zA-Z_]+$/;
    const passwordRegexp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    return {
      isUsernameInvalid: isTouched.username && !usernameRegexp.test(username),
      isPasswordInvalid: isTouched.password && !passwordRegexp.test(password),
      isRepeatInvalid: view === ViewIndex.SignUp && isTouched.r_password && password !== r_password,
    };
  }

  render() {
    const { isLoading } = this.props;
    const { view, form } = this.state;
    const isSignIn = view === ViewIndex.SignIn;
    const { isUsernameInvalid, isPasswordInvalid, isRepeatInvalid } = this.validateForm();
    const isInvalid = isUsernameInvalid || isPasswordInvalid || isRepeatInvalid;

    return (
      <div className={style.outer}>
        <div className={style.container}>
          <ContentSwitcher onChange={this.handleContentSwitcherChange} selectedIndex={view}>
            <Switch name="sign-in" text="Sign In"></Switch>
            <Switch name="sign-up" text="Sign Up"></Switch>
          </ContentSwitcher>

          <FluidForm className={style.formContainer}>
            <TextInput
              id="username"
              labelText="Username"
              invalidText="You username must only contain alphanumeric and underscore."
              invalid={isUsernameInvalid}
              required
              value={form.username}
              onChange={(e) => this.handleInputChange("username", e)}
            ></TextInput>
            <TextInput
              id="password"
              type="password"
              labelText="Password"
              invalidText="Your password must be at least 6 characters as well as contain at least one uppercase, one lowercase, and one number."
              invalid={isPasswordInvalid}
              required
              value={form.password}
              onChange={(e) => this.handleInputChange("password", e)}
            ></TextInput>
            {!isSignIn && (
              <TextInput
                id="r-password"
                type="password"
                labelText="Repeat Password"
                invalidText="Repeated password must match the password."
                invalid={isRepeatInvalid}
                required
                value={form.r_password}
                onChange={(e) => this.handleInputChange("r_password", e)}
              ></TextInput>
            )}
          </FluidForm>

          {isLoading ? (
            <InlineLoading
              style={{ marginLeft: "1rem" }}
              description="Please wait"
              status="active"
            />
          ) : (
            <Button disabled={isInvalid} onClick={this.handleSubmit}>
              {isSignIn ? "Login" : "Create new account"}
            </Button>
          )}
        </div>
      </div>
    );
  }
}
