import React, { createRef, useCallback, useMemo, useState } from 'react';
import {} from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

export const refs = {
  full_nameInput: createRef<HTMLInputElement>(),
  nicknameInput: createRef<HTMLInputElement>(),
  phoneInput: createRef<HTMLInputElement>(),
  emailInput: createRef<HTMLInputElement>(),
  schoolInput: createRef<HTMLInputElement>()
  // passwordInput: createRef<HTMLInputElement>(),
  // institutionInput: createRef<HTMLInputElement>(),
  // departmentInput: createRef<HTMLInputElement>(),
  // levelInput: createRef<HTMLInputElement>()
};

const App = () => {
  const [validation, setValidation] = useState({
    full_name: { helperText: '', err: false },
    nickname: { helperText: '', err: false },
    email: { helperText: '', err: false },
    phone: { helperText: '', err: false }
  });

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { id, value } = e.target;
      const isEmpty = !value.trim();

      switch (id) {
        case 'full_name':
          {
            const isInvalid = !/^\w{2,}\s+\w{2,}/.test(value.trim());

            setValidation((prev) => ({
              ...prev,
              full_name: {
                err: isEmpty || isInvalid,
                helperText: isEmpty
                  ? 'Full name required'
                  : isInvalid
                  ? 'Kindly enter your full name'
                  : ''
              }
            }));
          }
          break;
        case 'nickname':
          break;
        case 'email':
          {
            const isInvalid = !/^[^.].*[^.\W]+@[^.\W]+\..*[^.]+$/.test(
              value.trim()
            );

            setValidation((prev) => ({
              ...prev,
              email: {
                err: isEmpty || isInvalid,
                helperText: isEmpty
                  ? 'Email required'
                  : isInvalid
                  ? 'Email invalid'
                  : ''
              }
            }));
          }
          break;
        case 'phone': {
          const isInvalid = !/^\+?\d{7,15}$/.test(value.trim());

          setValidation((prev) => ({
            ...prev,
            phone: {
              err: isEmpty || isInvalid,
              helperText: isEmpty
                ? 'Phone required'
                : isInvalid
                ? 'Invalid phone number'
                : ''
            }
          }));
          break;
        }
      }
    },
    []
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
      } else {
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

  return (
    <Box className='App fade-in' position='relative'>
      <Container className='top-banner-container d-flex justify-content-center px-2'>
        <Box className='top-banner'></Box>
      </Container>

      <Container>
        <form
          className='d-flex justify-content-center  flex-column'
          noValidate
          autoComplete='on'
          onSubmit={(e: any) => e.preventDefault()}>
          <h1 className='text-center my-4'>MOC - Registration Form</h1>
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
                inputRef={refs.full_nameInput}
                helperText={validation.full_name.helperText}
                fullWidth
                onChange={handleInputChange}
                inputProps={inputProps}
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
                inputRef={refs.nicknameInput}
                helperText={''}
                fullWidth
                onChange={handleInputChange}
                inputProps={inputProps}
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
                inputRef={refs.emailInput}
                helperText={validation.email.helperText}
                fullWidth
                type='email'
                onChange={handleInputChange}
                inputProps={inputProps}
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
                inputRef={refs.phoneInput}
                helperText={validation.phone.helperText}
                type='tel'
                fullWidth
                onChange={handleInputChange}
                inputProps={inputProps}
              />
            </Col>
            <Col xs={12} className='text-field-container button-wrapper'>
              <Button
                variant='contained'
                size='large'
                disabled={false}
                id='sign-up'
                className='major-button'
                type='submit'
                color='primary'
                fullWidth
                // onClick={handleRegistrationRequest}
              >
                {/* {signup.status === 'pending' ? (
                  <CircularProgress color='inherit' size={28} />
                ) : (
                  'SIGN UP'
                )} */}
                Register
              </Button>
            </Col>
          </Row>
        </form>
      </Container>
    </Box>
  );
};

export default App;
