import React, { createRef, useCallback, useMemo, useState } from 'react';

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
import SendIcon from '@material-ui/icons/Send';
import TouchAppIcon from '@material-ui/icons/TouchApp';

const refs = {
  nickname: createRef<HTMLInputElement>(),
  phone: createRef<HTMLInputElement>(),
  email: createRef<HTMLInputElement>(),
  prayer_request: createRef<HTMLInputElement>()
};
const formRef = createRef<HTMLFormElement>();

const App = () => {
  const [validation, setValidation] = useState({
    nickname: { helperText: '', err: false, value: '' },
    email: { helperText: '', err: false, value: '' },
    phone: { helperText: '', err: false, value: '' },
    prayer_request: { helperText: '', err: false, value: '' }
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
      // case 'full_name': {
      //   const isInvalid = !/^[a-z]{2,}\s+[a-z]{2,}(\s+[a-z]{2,})?$/i.test(
      //     value.trim()
      //   );

      //   err = isEmpty || isInvalid;
      //   helperText = isEmpty
      //     ? 'Full name required'
      //     : isInvalid
      //     ? 'Kindly enter your full name'
      //     : '';
      //   break;
      // }
      case 'nickname': {
        err = isEmpty;
        helperText = isEmpty ? 'Kindly enter a/your nickname' : '';
        break;
      }
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
        const isInvalid = !/^(\+|0)\d{8,15}$/.test(value.trim());

        err = isEmpty || isInvalid;
        helperText = isEmpty
          ? 'Phone required'
          : isInvalid
          ? 'Input not a valid phone number'
          : '';
        break;
      }
      case 'prayer_request': {
        err = isEmpty;
        helperText = isEmpty ? 'Kindly enter your prayer request' : '';
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
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
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
      if (value.err || !(refs as any)[key].current?.value.trim()) {
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
      url: 'https://moc-backend.herokuapp.com/api/v1/request/save',
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
              ? `Thank you, ${validation.nickname.value}. Your prayer request has been received.`
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
      <Container>
        <form
          className='d-flex justify-content-center  flex-column slide-in-bottom'
          noValidate
          autoComplete='on'
          onSubmit={(e: any) => e.preventDefault()}
          ref={formRef}>
          <h1 className='text-center mb-4 mt-4 px-2'>
            BLW Campus Ministry
            <br />- Zone B -
          </h1>
          <h2 className='text-center mb-4 mt-4 px-2'>Prayer Request</h2>
          <Row className='align-self-center'>
            <Col xs={12} className='text-field-container'>
              <TextField
                required
                error={validation.nickname.err}
                variant='outlined'
                id='nickname'
                label='Nickname'
                size='medium'
                autoComplete='name'
                inputRef={refs.nickname}
                helperText={validation.nickname.helperText}
                aria-label='nickname'
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
                aria-label='email'
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
                aria-label='phone number'
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
            <Col xs={12} className='text-field-container'>
              <TextField
                required
                error={validation.prayer_request.err}
                variant='outlined'
                id='prayer_request'
                label='Request'
                size='medium'
                multiline
                rows={4}
                rowsMax={7}
                autoCapitalize='sentences'
                inputRef={refs.prayer_request}
                helperText={validation.prayer_request.helperText}
                aria-label='prayer request'
                fullWidth
                onChange={handleInputChange}
                inputProps={inputProps}
                InputProps={{
                  endAdornment: (
                    <InputAdornment
                      className='align-self-start mt-2'
                      position='end'>
                      <TouchAppIcon />
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
                onClick={handleRegistrationRequest}
                aria-label='submit'>
                {appState.isLoading ? (
                  <>
                    Sending your request...{' '}
                    <CircularProgress
                      color='inherit'
                      size={16}
                      className='ml-2'
                      thickness={4}
                    />
                  </>
                ) : (
                  <>
                    Send <SendIcon className='ml-2' />
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
