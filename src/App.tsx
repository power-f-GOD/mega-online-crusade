import React, { createRef, useCallback, useMemo, useState } from 'react';
import {} from 'react-router-dom';

import axios, { AxiosResponse } from 'axios';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import CircularProgress from '@material-ui/core/CircularProgress';
import InputAdornment from '@material-ui/core/InputAdornment';
import PersonIcon from '@material-ui/icons/PersonOutlined';
import MailIcon from '@material-ui/icons/MailOutlined';
import PhoneAndroidRoundedIcon from '@material-ui/icons/PhoneAndroidOutlined';
import PersonAddOutlinedIcon from '@material-ui/icons/PersonAddOutlined';

const refs = {
  full_name: createRef<HTMLInputElement>(),
  nickname: createRef<HTMLInputElement>(),
  phone: createRef<HTMLInputElement>(),
  email: createRef<HTMLInputElement>()
  // passwordInput: createRef<HTMLInputElement>(),
  // institutionInput: createRef<HTMLInputElement>(),
  // departmentInput: createRef<HTMLInputElement>(),
  // levelInput: createRef<HTMLInputElement>()
};
const formRef = createRef<HTMLFormElement>();

const App = () => {
  const [validation, setValidation] = useState({
    full_name: { helperText: '', err: false, value: '' },
    nickname: { helperText: '', err: false, value: '' },
    email: { helperText: '', err: false, value: '' },
    phone: { helperText: '', err: false, value: '' }
  });
  const [snackbarState, setSnackbarState] = useState<{
    open: boolean;
    severity: 'success' | 'error' | 'info';
    message: string;
  }>({ open: false, severity: 'success', message: '' });
  const [appState, setAppState] = useState({ isLoading: false, erred: false });

  const handleCloseSnackbar = (
    _event?: React.SyntheticEvent,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbarState((prev) => ({ ...prev, open: false }));
  };

  const validate = useCallback((id: string, value: string) => {
    const isEmpty = !value.trim();
    let helperText = {};
    let err = false;

    switch (id) {
      case 'full_name': {
        const isInvalid = !/^[a-z]{2,}\s+[a-z]{2,}(\s+[a-z]{2,})?$/i.test(
          value.trim()
        );

        err = isEmpty || isInvalid;
        helperText = isEmpty
          ? 'Full name required'
          : isInvalid
          ? 'Kindly enter your full name'
          : '';
        break;
      }
      case 'nickname':
        break;
      case 'email': {
        const isInvalid = !/^[^.].*[^.\W]+@[^.\W]+\..*[^.]+$/.test(
          value.trim()
        );

        err = isEmpty || isInvalid;
        helperText = isEmpty
          ? 'Email required'
          : isInvalid
          ? 'Input not a valid email'
          : '';
        break;
      }
      case 'phone': {
        const isInvalid = !/^\+?\d{8,15}$/.test(value.trim());

        err = isEmpty || isInvalid;
        helperText = isEmpty
          ? 'Phone required'
          : isInvalid
          ? 'Input not a valid phone number'
          : '';
        break;
      }
    }

    setValidation((prev) => ({
      ...prev,
      [id]: {
        err,
        helperText,
        value
      }
    }));
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      validate(e.target.id, e.target.value);
    },
    [validate]
  );

  const capitalizeInput = useCallback(
    (e: any) => {
      const { id, value } = e.target;

      if (/full_name|school/.test(id) && value) {
        e.target.value = value
          .split(' ')
          .map((word: string) =>
            /^(in|of|and|on)$/i.test(word)
              ? word.toLowerCase()
              : word[0].toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(' ');
      } else if (!/nick/.test(id)) {
        e.target.value = value.toLowerCase();
      }

      handleInputChange(e);
    },
    [handleInputChange]
  );

  const inputProps = useMemo(() => {
    return {
      onKeyPress: (e: any) => {
        if (e.key === 'Enter') {
          e.target.blur();
        }
      },
      onBlur: capitalizeInput
    };
  }, [capitalizeInput]);

  const sendData = useCallback(() => {
    const data = {} as any;
    let doesErr = false;

    for (const [key, value] of Object.entries(validation)) {
      if (
        value.err ||
        (!(refs as any)[key].current?.value.trim() && key !== 'nickname')
      ) {
        validate(key, value.value);
        doesErr = true;
      }

      data[key] = value.value;
    }

    setAppState({ isLoading: false, erred: doesErr });

    if (doesErr) return;

    data.school = window.location.pathname
      .split('/')
      .slice(-1)[0]
      .split('')
      .map((char) => char.toUpperCase())
      .join('');

    setAppState({ isLoading: true, erred: false });
    axios({
      url: 'https://moc-backend.herokuapp.com/api/v1/attendee/save',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data,
      validateStatus: (status) => (!/^(2|3|4)/.test(`${status}`) ? false : true)
    })
      .then(
        ({
          data: { error, message }
        }: AxiosResponse<{ error: boolean; message: string }>) => {
          setSnackbarState({
            severity: error ? 'info' : 'success',
            open: true,
            message: !error
              ? `Thank you, ${
                  validation.full_name.value.split(' ')[0]
                }. You've been successfully registered.`
              : /already.*registered/.test(message)
              ? "You've already been registered for the crusade. See you there. 🙂"
              : message + '.'
          });
          setAppState({ isLoading: false, erred: error });

          //reset form
          if (!error) {
            ((formRef.current as HTMLFormElement) ?? {}).reset();
          }
        }
      )
      .catch((e) => {
        setSnackbarState({
          severity: 'error',
          open: true,
          message: !navigator.onLine
            ? "You're offline."
            : /fetch|network|connect/i.test(e.message)
            ? 'A network error occurred. Please, check that you have an active internet connection.'
            : e.message
        });
        setAppState({ isLoading: false, erred: true });
      });
  }, [validation, validate]);

  const handleRegistrationRequest = useCallback(() => {
    sendData();
  }, [sendData]);

  return (
    <Box className='App fade-in' position='relative'>
      <Container className='top-banner-container d-flex justify-content-center'>
        <Box className='top-banner slide-in-top'></Box>
      </Container>

      <Container>
        <form
          className='d-flex justify-content-center  flex-column slide-in-bottom'
          noValidate
          autoComplete='on'
          onSubmit={(e: any) => e.preventDefault()}
          ref={formRef}>
          <h1 className='text-center mb-4 mt-4 px-2'>
            MOC - Attendee Registration Form
          </h1>
          <Row className='align-self-center'>
            <Col xs={12} className='text-field-container'>
              <TextField
                required
                error={validation.full_name.err}
                variant='outlined'
                id='full_name'
                label='Full Name'
                size='medium'
                autoComplete='name'
                inputRef={refs.full_name}
                helperText={validation.full_name.helperText}
                fullWidth
                onChange={handleInputChange}
                inputProps={inputProps}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <PersonIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Col>
            <Col xs={12} className='text-field-container'>
              <TextField
                error={false}
                variant='outlined'
                id='nickname'
                label='Nickname'
                size='medium'
                autoComplete='nickname'
                inputRef={refs.nickname}
                helperText={''}
                fullWidth
                onChange={handleInputChange}
                inputProps={inputProps}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <PersonIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Col>
            <Col xs={12} className='text-field-container'>
              <TextField
                required
                error={validation.email.err}
                variant='outlined'
                id='email'
                label='Email'
                size='medium'
                autoComplete='email'
                inputRef={refs.email}
                helperText={validation.email.helperText}
                fullWidth
                type='email'
                onChange={handleInputChange}
                inputProps={inputProps}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <MailIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Col>
            <Col xs={12} className='text-field-container'>
              <TextField
                required
                error={validation.phone.err}
                variant='outlined'
                id='phone'
                label='Phone'
                size='medium'
                autoComplete='tel'
                inputRef={refs.phone}
                helperText={validation.phone.helperText}
                type='tel'
                fullWidth
                onChange={handleInputChange}
                inputProps={inputProps}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <PhoneAndroidRoundedIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Col>
            <Col xs={12} className='text-field-container button-wrapper'>
              <Button
                variant='contained'
                size='large'
                disabled={appState.isLoading}
                id='sign-up'
                className='major-button'
                type='submit'
                color='primary'
                fullWidth
                onClick={handleRegistrationRequest}>
                {appState.isLoading ? (
                  <>
                    Registering you...{' '}
                    <CircularProgress
                      color='inherit'
                      size={16}
                      className='ml-2'
                      thickness={4}
                    />
                  </>
                ) : (
                  <>
                    Register <PersonAddOutlinedIcon className='ml-2' />
                  </>
                )}
              </Button>
            </Col>
          </Row>
        </form>
      </Container>

      <Snackbar
        open={snackbarState.open}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={handleCloseSnackbar}>
        <MuiAlert
          elevation={6}
          variant='filled'
          severity={snackbarState.severity}
          onClose={handleCloseSnackbar}>
          {snackbarState.message}
          {!appState.erred && (
            <>
              <br />
              See you at the crusade!{' '}
              <span role='img' aria-label='love emoji'>
                🙂
              </span>
            </>
          )}
        </MuiAlert>
      </Snackbar>

      <Container as='footer' className='slide-in-bottom'>
        Made with love
        <span role='img' aria-label='love emoji'>
          ❤️
        </span>{' '}
        by the BLWUNN{' '}
        <button className='revealer' onClick={(e) => e.preventDefault()}>
          Dev Team
        </button>
        <br />
        <div className='devs'>
          ❯{' '}
          <a
            href='https://web.facebook.com/power.sunday3'
            target='_blank'
            rel='noopener noreferrer'>
            @Power'f-GOD{' '}
            <span role='img' aria-label='love emoji'>
              ⚡️⚡️
            </span>{' '}
          </a>{' '}
          et
          <a
            href='https://web.facebook.com/profile.php?id=100015216757988'
            target='_blank'
            rel='noopener noreferrer'>
            @NuelSOFT
          </a>
        </div>
      </Container>
    </Box>
  );
};

export default App;
