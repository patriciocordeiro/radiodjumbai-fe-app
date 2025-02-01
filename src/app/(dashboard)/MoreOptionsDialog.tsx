'use client';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';

const moreOptions = [
  { label: 'Sobre Radio Djumbai', link: '/sobre-nos' },
  { label: 'Contactos', link: '/contatos' },
  { label: 'Nossa equipa', link: '/nossa-equipa' },
];

type MoreOptionsDialogProps = Readonly<{
  open: boolean;
  onClose: () => void;
}>;
export default function MoreOptionsDialog({
  open,
  onClose,
}: MoreOptionsDialogProps) {
  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <DialogTitle>
        More Options
        <IconButton
          edge='start'
          color='inherit'
          onClick={onClose}
          aria-label='close'
          sx={{ position: 'absolute', left: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <List>
          {moreOptions.map((option, index) => (
            <Link key={option.link} href={option.link} passHref>
              <ListItem component={Link} href={option.link} onClick={onClose}>
                <ListItemText primary={option.label} />
              </ListItem>
            </Link>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}
